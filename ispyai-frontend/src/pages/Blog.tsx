/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import ReactMarkdown from 'react-markdown';
import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ExternalLinkIcon } from '@chakra-ui/icons';

const Blog = () => {
	const [title, setTitle] = useState('');
	const [videoUrl, setVideoUrl] = useState('');
	const [jobStatus, setJobStatus] = useState('');
	const jobStatusRef = useRef('');

	const session = useSelector((state: any) => state.session);

	// const content = blog?.data;

	// const contentNew = content?.split('\n');

	// const markdown = `
	// ${contentNew.map((line) => {
	//       return `${line}\n`
	// }).join('')}
	// `

	const getVideoTitle = async (url) => {
		try {
			const video = await axios.get(url);
			setTitle(video.data.title);
		} catch (error) {
			console.log(error);
		}
	};

	const getJobStatus = async (jobId) => {
		try {
			const job = await axios.get(
				`http://video-publi-18ljnttgnyky9-1470409612.us-west-2.elb.amazonaws.com/getJob/${jobId}`
			);
			console.log(job.data);
			jobStatusRef.current = job.data.status; // Update the jobStatusRef value
			setJobStatus(job.data.status);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		// get youtube video title from url
		const videoUrl = session.video;
		const videoId = videoUrl?.split('https://')[1];
		const url = `https://www.youtube.com/oembed?url=${videoId}&format=json`;
		const blog = session.blog;
		console.log(`url: ${url}`);
		console.log(`blog: ${JSON.stringify(blog)}`);
		setVideoUrl(videoUrl);
		getVideoTitle(url);

		// get id from url
		const pageUrl = window.location.href;
		const jobId = pageUrl.split('/')[4];
		console.log(jobId);

		// eslint-disable-next-line prefer-const
		let intervalId: number;

		const fetchStatus = () => {
			getJobStatus(jobId);

			if (intervalId) {
				console.log(`intervalId: ${intervalId}`);
				console.log(`jobStatus: ${jobStatusRef.current}`);
				if (
					jobStatusRef.current === 'SUCCEEDED' ||
					jobStatusRef.current === 'FAILED'
				) {
					clearInterval(intervalId);
				}
			}
		};

		fetchStatus(); // Initial fetch

		intervalId = setInterval(fetchStatus, 3000); // Periodically fetch every 3 seconds

		return () => {
			clearInterval(intervalId); // Cleanup the interval on component unmount
		};
	}, []);

	return (
		<Container maxW={{ base: 'xl', md: '2xl' }} mt={10}>
			<Stack
				as={Box}
				textAlign={'center'}
				spacing={{ base: 8, md: 14 }}
				py={{ base: 12, md: 26 }}
			>
				<a href={videoUrl} target="_blank">
					<Heading
						fontWeight={600}
						fontSize={{ base: 'lg', sm: 'md', md: '3xl' }}
						lineHeight={'110%'}
					>
						Video Title:
						<Text
							fontWeight={700}
							color={'green.400'}
							textDecoration="underline"
						>
							{' '}
							{title}
							<ExternalLinkIcon boxSize={4} marginLeft="1" />
						</Text>
					</Heading>
				</a>

				{/* <ReactMarkdown
					components={ChakraUIRenderer()}
					children={markdown}
				/> */}

				{jobStatus == 'SUCCEEDED' ? (
					<a href={`/list`}>
						<button
							style={{
								marginLeft: '10px',
								padding: '10px',
								background: 'green'
							}}
						>
							Go to List
						</button>
					</a>
				) : jobStatus == 'FAILED' ? (
					<a href={`/generate`}>
						<button
							style={{
								marginLeft: '10px',
								padding: '10px',
								background: 'red'
							}}
						>
							Failed to process. Go back.
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
			</Stack>
		</Container>
	);
};

export default Blog;
