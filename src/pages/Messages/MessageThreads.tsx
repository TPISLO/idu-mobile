import { Divider, List } from '@material-ui/core'
import { Snackbar, TopLoading } from 'components'
import { UNAUTHORIZED } from 'http-status-codes'
import { useLocale } from 'locales'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect } from 'react'
import { useBottomScrollListener } from 'react-bottom-scroll-listener'
import { messagesStore, metaStore, userStore } from 'stores'
import useAsync from 'use-async-react'
import ThreadItem, { SkeletonThreadItem } from './ThreadItem'

const MessageList = observer(() => {
	const { ERROR_GENERIC } = useLocale()
	const messages = useContext(messagesStore)
	const user = useContext(userStore)
	const meta = useContext(metaStore)
	const { call: fetchNextThreads, loading, error } = useAsync(messages.fetchNextThreads)

	useBottomScrollListener(() => {
		if (user.token && meta.isOnline) fetchNextThreads(user.token)
	}, 100)

	useEffect(() => {
		if (user.token && meta.isOnline) fetchNextThreads(user.token)
	}, [fetchNextThreads, user.token, meta.isOnline])

	useEffect(() => {
		if (error?.status === UNAUTHORIZED) user.logout(true)
	}, [error, user])

	return (
		<>
			{error && <Snackbar variant="error">{ERROR_GENERIC}</Snackbar>}
			{loading && messages.threads && <TopLoading />}
			<List>
				{loading && !messages.threads && (
					<>
						{[...new Array(5)].map((_, i) => (
							<React.Fragment key={i}>
								<SkeletonThreadItem />
								<Divider />
							</React.Fragment>
						))}
					</>
				)}
				{messages.threads?.map((e, i) => (
					<React.Fragment key={i}>
						<ThreadItem {...e} />
						<Divider />
					</React.Fragment>
				))}
				{meta.isOnline && !messages.noMoreThreads && <SkeletonThreadItem />}
			</List>
		</>
	)
})

export default MessageList
