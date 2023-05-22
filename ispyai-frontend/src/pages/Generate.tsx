/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	Box,
	Heading,
	Container,
	Text,
	Stack,
	Input,
	Button,
	Progress,
	useColorMode
} from '@chakra-ui/react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setBlog, setVideo } from '../redux/slices/SessionSlice';
import { AppDispatch } from '../redux/store/store';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Generate = () => {
	const [loading, setLoading] = useState(false);
	const [url, setUrl] = useState('');
	const { colorMode } = useColorMode();
	const dispatch = useDispatch<AppDispatch>();
	const session = useSelector((state: any) => state.session);
	const naviagate = useNavigate();

	const handleGenerate = async () => {
		setLoading(true);
		const jobId = await sendGenerateRequest();
		dispatch(setVideo(url));
		setLoading(false);
		naviagate(`/blog/${jobId}`);
	};

	const sendGenerateRequest = async () => {
		try {
			const res = await axios.post(
				'https://ispyai.osuapp.club/submitJob',
				{
					userId: session.userId,
					videoUrl: url
				}
			);

			console.log(res.data);

			dispatch(setBlog(res.data));

			return res.data.jobId;
		} catch (error) {
			console.log(error);
		}
	};

	// const sendGenerateRequest = async () => {
	//       const req = {
	//             "userId": session.userId,
	//             "videoUrl": url
	//       }
	//       dispatch(setVideo(url));
	//       dispatch(submitJob(req));
	// };

	// useEffect(() => {
	//       const fetchJobStatus = async () => {
	//             if (!session.jobId) return;
	//             const res = await axios.get(`https://ispyai.osuapp.club/getJob/${session.jobId}`);
	//             if (res.data.status === "SUCCEEDED") {
	//                   naviagate(`/blog/${session.jobId}`);
	//             } else {
	//                   setTimeout(() => {
	//                         fetchJobStatus();
	//                   }, 5000);
	//             }
	//       }
	//       fetchJobStatus();
	// }, [session.jobId, naviagate]);

	return (
		<Container maxW={'3xl'}>
			<Stack
				as={Box}
				textAlign={'center'}
				spacing={{ base: 8, md: 14 }}
				py={{ base: 12, md: 26 }}
			>
				<Heading
					fontWeight={600}
					fontSize={{ base: '2xl', sm: '4xl', md: '5xl' }}
					lineHeight={'110%'}
				>
					Turn your <br />
					<Text as={'span'} color={'green.400'}>
						favorite videos
					</Text>
					<br />
					into blog posts.
				</Heading>

				<Heading
					fontWeight={600}
					fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
					lineHeight={'110%'}
				>
					Copy and paste your YouTube link below to get started.
				</Heading>

				{!loading ? (
					<Box
						rounded={'lg'}
						bg={colorMode === 'light' ? 'white' : 'gray.700'}
						boxShadow={'lg'}
						p={8}
					>
						<Stack spacing={4}>
							<Text
								color={'green.500'}
								fontWeight={600}
								fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
								lineHeight={'110%'}
							>
								YouTube Link
							</Text>
							<Input
								placeholder="Enter a YouTube link..."
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								size="lg"
								variant="filled"
							/>
						</Stack>
					</Box>
				) : (
					<Box
						rounded={'lg'}
						bg={colorMode === 'light' ? 'white' : 'gray.700'}
						boxShadow={'lg'}
						p={8}
					>
						<Stack spacing={4}>
							<Text
								color={'green.500'}
								fontWeight={600}
								fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
								lineHeight={'110%'}
							>
								Generating...
							</Text>
							<Progress size="lg" hasStripe isIndeterminate />
						</Stack>
					</Box>
				)}

				<Stack
					direction={'column'}
					spacing={3}
					align={'center'}
					alignSelf={'center'}
					position={'relative'}
				>
					<Button
						isLoading={loading}
						onClick={handleGenerate}
						colorScheme={'green'}
						bg={'green.400'}
						rounded={'full'}
						px={6}
						_hover={{
							bg: 'green.500'
						}}
					>
						Generate
					</Button>

					<Button
						variant={'link'}
						colorScheme={'blue'}
						size={'sm'}
						onClick={() => window.history.back()}
						py={4}
					>
						Go Back
					</Button>
				</Stack>
			</Stack>
		</Container>
	);
};

export default Generate;
