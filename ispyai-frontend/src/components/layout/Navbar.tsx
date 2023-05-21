import {
	Box,
	Flex,
	Button,
	Menu,
	MenuButton,
	MenuList,
	MenuItem,
	MenuDivider,
	useColorModeValue,
	Stack,
	useColorMode,
	Center,
	Heading
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
	const { colorMode, toggleColorMode } = useColorMode();
	// const { isOpen, onOpen, onClose } = useDisclosure();
	const navigate = useNavigate();
	return (
		<>
			<Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
				<Flex
					h={16}
					alignItems={'center'}
					justifyContent={'space-between'}
				>
					<Box mx={8}>
						<Heading
							size="xl"
							color={'green.400'}
							cursor={'pointer'}
							onClick={() => {
								navigate('/');
							}}
						>
							iSpyAI
						</Heading>
					</Box>

					<Flex alignItems={'center'}>
						<Stack direction={'row'} spacing={1}>
							<Button onClick={toggleColorMode}>
								{colorMode === 'light' ? (
									<MoonIcon />
								) : (
									<SunIcon />
								)}
							</Button>

							<Menu>
								<MenuButton
									as={Button}
									rounded={'full'}
									variant={'link'}
									cursor={'pointer'}
									size={'lg'}
									minW={0}
									px={8}
								>
									<HamburgerIcon />
								</MenuButton>
								<MenuList alignItems={'center'}>
									<br />
									<Center>
										<Heading
											size="xl"
											cursor={'pointer'}
											color={'green.400'}
											onClick={() => {
												navigate('/');
											}}
										>
											iSpyAI
										</Heading>
									</Center>
									<br />
									<MenuDivider />
									<MenuItem
										onClick={() => {
											navigate('/');
										}}
									>
										Home
									</MenuItem>
									<MenuItem
										onClick={() => {
											navigate('/generate');
										}}
									>
										Generate
									</MenuItem>
									<MenuItem
										onClick={() => {
											navigate('/list');
										}}
									>
										Your Blogs
									</MenuItem>
								</MenuList>
							</Menu>
						</Stack>
					</Flex>
				</Flex>
			</Box>
		</>
	);
}
