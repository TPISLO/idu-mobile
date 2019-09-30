import { Theme } from 'constants/interfaces'
import { Language } from 'locales/strings'
import { action, autorun, observable } from 'mobx'

export default class {
	@observable language: Language = /en/i.test(window.navigator.language) ? Language.en : Language.pl
	@observable theme: Theme = window.matchMedia(`(prefers-color-scheme: dark)`).matches
		? 'dark'
		: 'light'

	constructor() {
		this.load()
		autorun(() => this.save())
	}

	@action
	changeLanguage = (to: Language) => (this.language = to)

	@action
	changeTheme = (to: Theme) => (this.theme = to)

	save = () =>
		window.localStorage.setItem(
			'ConfigStore',
			JSON.stringify({ language: this.language, theme: this.theme })
		)

	@action
	load = () => Object.assign(this, JSON.parse(window.localStorage.getItem('ConfigStore') || '{}'))
}