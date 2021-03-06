import { Roles } from './interfaces'

export type Login = {
	token: string
	exp: string
}

export type Profile = {
	data: {
		id: number
		first_name: string
		last_name: string
		mobile_phone: string
		role: keyof typeof Roles
		messages_count: number
		unread_messages_count: number
		unread_informations_count: number
	}
}

export type Events = {
	data: {
		id: number
		name: string
		start_at: string
		stop_at: string
		all_day: boolean
		all_klasses: boolean
		background_color: string
		text_color: string
	}[]
}

export type MessageThreads = {
	data: {
		id: number
		from: {
			id: number
			name: string
			avatar: string
		}
		title: string
		body: string
		status: 1 | 2 | 3
		created_at: string
		last_message_at: string | null
		updated_at: string
	}[]
}

export type SpecificMessages = {
	data: {
		id: number
		from: {
			id: number
			name: string
			avatar: string
		}
		title: string
		body: string
		created_at: string
	}[]
}

export type News = {
	data: {
		id: number
		title: string
		body: string
		priority: 1 | 2
		edited_at: string
		start_at: string
		is_confirmation_required: boolean
		read_at: null | string
		confirmed_at: null | string
	}[]
}

export type UsersSearch = {
	data: {
		id: number
		first_name: string
		last_name: string
		type: 0 | 1 | 2
	}[]
}
