/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Flex, Grid, Heading, IconButton, Text } from '@chakra-ui/react';
import { DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'

export interface Item {
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
		<Grid gap={6} width='100%'>
			<Heading size='lg' marginBottom='10px' m="0 auto" my={12}>
				Your Blog Posts ({itemList.length})
			</Heading>
			{
				itemList.map((item) => (
					<Card key={item.jobId} marginBottom='10px' m="0 auto" maxW="320px">
						<CardHeader>
							<Heading size='md'>{item.jobId}</Heading>
						</CardHeader>
						<CardBody>
							<Text fontSize='xl' marginBottom='10px' as='a' cursor={'pointer'} onClick={() => window.open(item.videoUrl, '_blank')}>
								{item.videoUrl}
								<ExternalLinkIcon boxSize={4} marginLeft="1" />
							</Text>
						</CardBody>

						<CardFooter>
							{item.presignedUrl != null ? (
								<IconButton aria-label="Download" icon={<DownloadIcon />} onClick={() => window.open(item.presignedUrl, '_blank')} />
							) : (
								<Button disabled>Processing...</Button>
							)}
						</CardFooter>
					</Card>
				))
			}
		</Grid >
	);
};

export default List;
