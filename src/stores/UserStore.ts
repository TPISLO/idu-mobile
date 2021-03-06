import { Roles } from 'constants/interfaces'
import * as responses from 'constants/responses'
import * as urls from 'constants/urls'
import { action, autorun, computed, observable, runInAction } from 'mobx'
import { constructFetchErr } from 'utils'

export type Event = {
	id: number
	name: string
	startAt: Date
	stopAt: Date
	allDay: boolean
	allClasses: boolean
	backgroundColor: string
	textColor: string
}

type Profile = {
	id: number
	firstName: string
	lastName: string
	mobilePhone: string
	role: Roles
	unreadMessagesCount: number
	unreadNewsCount: number
}

export class UserStore {
	static localStorageKey = 'UserStore'

	@observable token?: string
	@observable events?: Event[]
	@observable profile?: Profile
	@observable forcedLogout = false

	constructor() {
		this.load()
		autorun(this.save)
	}

	private save = (): void =>
		window.localStorage.setItem(
			UserStore.localStorageKey,
			JSON.stringify({
				token: this.token,
				events: this.events,
				profile: this.profile
			})
		)

	@action
	private load = (): void => {
		Object.assign(this, JSON.parse(window.localStorage.getItem(UserStore.localStorageKey) || '{}'))

		this.events = this.events?.map(e => ({
			...e,
			startAt: new Date(e.startAt),
			stopAt: new Date(e.stopAt)
		}))
	}

	login = async (login: string, password: string): Promise<NonNullable<this['token']>> => {
		runInAction(() => (this.forcedLogout = false))

		const res = await fetch(urls.api.login(), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				login,
				password
			})
		})

		if (!res.ok) {
			throw await constructFetchErr(res)
		}

		const json = (await res.json()) as responses.Login
		runInAction(() => (this.token = json.token))

		return (this.token as this['token'])!
	}

	@action
	logout = (forced = false): void => {
		this.token = undefined
		this.profile = undefined
		this.events = undefined
		this.forcedLogout = forced
	}

	@computed
	get isLoggedIn(): boolean {
		return !!this.token
	}

	fetchEvents = async (): Promise<NonNullable<this['events']>> => {
		if (!this.token) {
			throw new Error("Can't fetch events without a token")
		}

		const res = await fetch(urls.api.events(), {
			headers: {
				'X-API-TOKEN': this.token
			}
		})

		if (!res.ok) {
			throw await constructFetchErr(res)
		}

		const json = (await res.json()) as responses.Events
		runInAction(() => {
			this.events = json.data.map(e => ({
				id: e.id,
				name: e.name,
				startAt: new Date(e.start_at),
				stopAt: new Date(e.stop_at),
				allDay: e.all_day,
				allClasses: e.all_klasses,
				backgroundColor: e.background_color,
				textColor: e.text_color
			}))
		})

		return (this.events as this['events'])!
	}

	fetchProfile = async (): Promise<NonNullable<this['profile']>> => {
		if (!this.token) {
			throw new Error("Can't fetch events without a token")
		}

		const res = await fetch(urls.api.profile(), {
			headers: {
				'X-API-TOKEN': this.token
			}
		})

		if (!res.ok) {
			throw await constructFetchErr(res)
		}

		const json = (await res.json()) as responses.Profile
		runInAction(() => {
			this.profile = {
				id: json.data.id,
				firstName: json.data.first_name,
				lastName: json.data.last_name,
				mobilePhone: json.data.mobile_phone,
				role: Roles[json.data.role],
				unreadNewsCount: json.data.unread_informations_count,
				unreadMessagesCount: json.data.unread_messages_count
			}
		})

		return (this.profile as this['profile'])!
	}

	@action
	decreaseUnreadNews = () => {
		if (this.profile) this.profile.unreadNewsCount--
	}
}
