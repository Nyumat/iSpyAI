import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';

interface Item {
	videoUrl: string;
	presignedUrl: string | null;
	jobId: string;
}

const List: React.FC = () => {
	const session = useSelector((state: any) => state.session);
	const [itemList, setItemList] = useState<Item[]>([]);

	useEffect(() => {
		// Fetch data from the API
		const fetchData = () => {
			fetch(
				`http://video-publi-18ljnttgnyky9-1470409612.us-west-2.elb.amazonaws.com/getJobEntries/${session.userId}`
			)
				.then((response) => response.json())
				.then((data) => {
					const items: Item[] = data.map((item: any) => ({
						videoUrl: item.value.videoUrl,
						presignedUrl: item.value.presignedUrl,
						jobId: item.value.jobId
					}));
					console.log(items);
					setItemList(items);
				})
				.catch((error) => console.error(error));
		};

		fetchData(); // Initial fetch

		const intervalId = setInterval(fetchData, 3000); // Periodically fetch every 3 seconds

		return () => {
			clearInterval(intervalId); // Cleanup the interval on component unmount
		};
	}, []);

	return (
		<div>
			<h1>Blog Posts</h1>
			<ul>
				{itemList.map((item) => (
					<li key={item.jobId}>
						<a href={item.videoUrl} target="_blank">
							<Text
								fontWeight={700}
								color={'green.400'}
								textDecoration="underline"
							>
								{item.videoUrl}
								<ExternalLinkIcon boxSize={4} marginLeft="1" />
							</Text>
						</a>

						{item.presignedUrl != null ? (
							<a href={item.presignedUrl} download>
								<button
									style={{
										marginLeft: '10px',
										padding: '10px',
										background: 'green'
									}}
								>
									Download
								</button>
							</a>
						) : (
							<button
								style={{
									marginLeft: '10px',
									padding: '10px',
									background: 'gray',
									cursor: 'not-allowed'
								}}
								disabled
							>
								Processing...
							</button>
						)}
					</li>
				))}
			</ul>
		</div>
	);
};

export default List;
