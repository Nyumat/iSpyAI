/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import ReactMarkdown from 'react-markdown';
import {
	Box,
	Button,
	Center,
	Container,
	Flex,
	Heading,
	Stack,
	Text,
	useColorMode,
	useColorModeValue,
	useMediaQuery
} from '@chakra-ui/react';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Rings } from 'react-loader-spinner';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Item } from './List';

const Blog = () => {
	const [title, setTitle] = useState('');
	const [item, setItem] = useState({} as Item);
	const [videoUrl, setVideoUrl] = useState('');
	const [jobStatus, setJobStatus] = useState('');
	const { colorMode } = useColorMode();
	const [showBlog, setShowBlog] = useState(false);
	const [markdown, setMarkdown] = useState('');
	const jobStatusRef = useRef('');
	const { id } = useParams();
	const isMobile = useMediaQuery('(max-width: 768px)')[0];
	const navigate = useNavigate();
	const dots = ['.', '.', '.'].map((dot, i) => (
		<motion.span
			key={i}
			animate={{ opacity: [1, 0], y: [0, -10], x: [0, 10] }}
			transition={{
				duration: 1.5,
				repeat: Infinity,
				repeatDelay: 0.5,
				ease: 'linear'
			}}
		>
			{dot}
		</motion.span>
	));

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

	function handleList() {
		navigate('/list');
	}

	const handlePreivew = async () => {
		fetch(
			`http://video-publi-18ljnttgnyky9-1470409612.us-west-2.elb.amazonaws.com/getJobEntries/${session.blog.userId}`
		)
			.then((response) => response.json())
			.then((data) => {
				const items: Item[] = data.map((item: any) => ({
					videoUrl: item.value.videoUrl,
					presignedUrl: item.value.presignedUrl,
					jobId: item.value.jobId
				}));
				setItem(items[0]);
				const item = items.find((item) => item.jobId === id);

				if (item) {
					setItem(item);
					setShowBlog(true);
				}
			})
			.catch((error) => console.error(error));
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
		let intervalId;

		if (showBlog) {
			axios.get(item.presignedUrl).then((response) => {
				setMarkdown(response.data);
			});
		}

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
	}, [showBlog]);

	console.log(markdown);

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

				{jobStatus == 'SUCCEEDED' ? (
					<>
						<Heading as="h1" size="3xl" mb={12}>
							Your blog post is ready!
						</Heading>
						<Center>
							<Box
								w="100%"
								p={4}
								color={useColorModeValue('gray.800', 'white')}
								mt={10}
								display={{ md: 'flex' }}
								alignItems={{ md: 'center' }}
								flexDirection={{ md: 'row' }}
							>
								<Flex
									justifyContent="center"
									alignItems="center"
									mb={4}
									flexDirection={'column'}
									mr={4}
								>
									<Heading as="h2" size="md" maxW="sm">
										Click this button to preview your blog
										post.
									</Heading>
									<Button
										mt={4}
										colorScheme="green"
										onClick={handlePreivew}
									>
										Preview Blog Post
									</Button>
								</Flex>
								<Text
									fontSize="3xl"
									mt={2}
									mb={4}
									opacity={0.7}
								>
									OR
								</Text>

								<Flex
									justifyContent="center"
									alignItems="center"
									mb={4}
									flexDirection={'column'}
									ml={4}
								>
									<Heading as="h2" size="md" maxW="sm">
										Click this button to view your lists of
										blog posts.
									</Heading>
									<Button
										mt={4}
										colorScheme="green"
										onClick={handleList}
									>
										Go To List
									</Button>
								</Flex>
							</Box>
						</Center>
					</>
				) : jobStatus == 'FAILED' ? (
					<Center>
						<Box
							w="100%"
							p={4}
							color={useColorModeValue('gray.800', 'white')}
							mt={10}
							display={{ md: 'flex' }}
							alignItems={{ md: 'center' }}
							flexDirection={{ md: 'column' }}
						>
							<Heading as="h1" size="3xl" mb={12}>
								Your video failed to process.
							</Heading>
							<Button
								mt={4}
								colorScheme="green"
								onClick={() => navigate(-1)}
							>
								Go Back
							</Button>
						</Box>
					</Center>
				) : (
					<Center>
						<Box
							as={motion.div}
							transform={'translateY(-50%)'}
							display={'flex'}
							flexDirection={'column'}
							alignItems={'center'}
							justifyContent={'center'}
						>
							<Rings
								height={isMobile ? '70vh' : '80vh'}
								width={isMobile ? '70vw' : '80vw'}
								color={`${
									colorMode === 'dark'
										? 'MediumSpringGreen'
										: 'MediumSeaGreen'
								}`}
								radius="6"
								wrapperStyle={{
									opacity: `${
										colorMode === 'dark' ? '0.1' : '0.8'
									}`,
									position: 'absolute',
									transform: 'translateY(75%)',
									bottom: '0'
								}}
								visible={true}
								ariaLabel="rings-loading"
							/>
							<Text fontSize="4xl" fontWeight="bold">
								We are processing your video
								{dots}
							</Text>
						</Box>
					</Center>
				)}

				{showBlog && (
					<ReactMarkdown
						components={ChakraUIRenderer()}
						children={markdown}
					/>
				)}
			</Stack>
		</Container>
	);
};

export default Blog;
