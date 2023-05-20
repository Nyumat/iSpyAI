import {
      Box,
      Heading,
      Container,
      Text,
      Stack,
      Input,
      Button,
      Progress,
      useColorMode,

} from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';

const Generate = () => {

      const [loading, setLoading] = useState(false);
      const [url, setUrl] = useState('');
      const { colorMode } = useColorMode();

      const handleGenerate = async () => {
            setLoading(true);
            sendGenerateRequest();
            setTimeout(() => {
                  setLoading(false);
            }, 3000);
      };

      const sendGenerateRequest = async () => {
            const response = await axios.post('http://localhost:8080/api/generate', {
                  url: url,
            });
            console.log(response);
      };

      return (
            <Container maxW={'3xl'}>
                  <Stack
                        as={Box}
                        textAlign={'center'}
                        spacing={{ base: 8, md: 14 }}
                        py={{ base: 12, md: 26 }}>
                        <Heading
                              fontWeight={600}
                              fontSize={{ base: '2xl', sm: '4xl', md: '5xl' }}
                              lineHeight={'110%'}>
                              Summarize your <br />
                              <Text as={'span'} color={'green.400'}>
                                    favorite videos.
                              </Text>
                        </Heading>

                        <Heading
                              fontWeight={600}
                              fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                              lineHeight={'110%'}>
                              Copy and paste your YouTube link below to get started.
                        </Heading>


                        {!loading ? (
                              <Box
                                    rounded={'lg'}
                                    bg={colorMode === 'light' ? 'white' : 'gray.700'}
                                    boxShadow={'lg'}
                                    p={8}>
                                    <Stack spacing={4}>
                                          <Text
                                                color={'green.500'}
                                                fontWeight={600}
                                                fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                                                lineHeight={'110%'}>
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
                                    p={8}>
                                    <Stack spacing={4}>
                                          <Text
                                                color={'green.500'}
                                                fontWeight={600}
                                                fontSize={{ base: 'md', sm: 'xl', md: '2xl' }}
                                                lineHeight={'110%'}>
                                                Generating...
                                          </Text>
                                          <Progress size="xs" isIndeterminate />
                                    </Stack>
                              </Box>
                        )}


                        <Stack
                              direction={'column'}
                              spacing={3}
                              align={'center'}
                              alignSelf={'center'}
                              position={'relative'}>
                              <Button
                                    isLoading={loading}
                                    onClick={handleGenerate}
                                    colorScheme={'green'}
                                    bg={'green.400'}
                                    rounded={'full'}
                                    px={6}
                                    _hover={{
                                          bg: 'green.500',
                                    }}>
                                    Generate
                              </Button>

                              <Button variant={'link'} colorScheme={'blue'} size={'sm'} onClick={() => window.history.back()} py={4}>
                                    Go Back
                              </Button>

                              <Box py={8}>
                                    <Text
                                          color={'gray.500'}
                                          maxW={'3xl'}
                                          fontSize={{ base: 'md', lg: 'xl' }}>
                                          Once the blog post is generated, you will be automatically
                                          redirected to the blog post page.
                                    </Text>
                              </Box>

                        </Stack>


                  </Stack>
            </Container>

      )
}

export default Generate
