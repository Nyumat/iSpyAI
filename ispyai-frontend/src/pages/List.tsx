/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Grid, Heading } from '@chakra-ui/react';
import { DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Card, CardHeader, CardFooter } from '@chakra-ui/react';

export interface Item {
	videoUrl: string;
	videoTitle: string;
	presignedUrl: string | null;
	jobId: string;
}

const List: React.FC = () => {
	const session = useSelector((state: any) => state.session);
	const [itemList, setItemList] = useState<Item[]>([]);

	useEffect(() => {
		// Fetch data from the API
		const fetchData = () => {
			fetch(`https://ispyai.osuapp.club/getJobEntries/${session.userId}`)
				.then((response) => response.json())
				.then((data) => {
					const items: Item[] = data.map((item: any) => ({
						videoUrl: item.value.videoUrl,
						videoTitle: item.value.videoTitle,
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
		<Grid gap={6} width="100%">
			<Heading size="lg" marginBottom="10px" m="0 auto" my={12}>
				Your Blog Posts ({itemList.length})
			</Heading>
			{itemList.map((item) => (
				<Card
					key={item.jobId}
					marginBottom="10px"
					m="0 auto"
					width="400px"
				>
					<CardHeader>
						<a href={`/blog/${item.jobId}`} target="_blank">
							<Heading size="md" textDecoration="underline">
								{item.videoTitle}
								<ExternalLinkIcon boxSize={4} marginLeft="1" />
							</Heading>
						</a>
					</CardHeader>

					<CardFooter>
						{item.presignedUrl != null ? (
							<Button>
								{'Download blog'}
								<DownloadIcon style={{ marginLeft: '8px' }} />
							</Button>
						) : (
							<Button disabled>Processing...</Button>
						)}
					</CardFooter>
				</Card>
			))}
		</Grid>
	);
};

export default List;
