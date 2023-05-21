import ReactMarkdown from 'react-markdown'
import { Box, Container, Heading, Stack, Text } from '@chakra-ui/react'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Blog = () => {
      const [title, setTitle] = useState('');
      const session = useSelector((state: any) => state.session);
      const videoUrl = session.video;
      const videoId = videoUrl?.split('https://')[1];
      const url = `https://www.youtube.com/oembed?url=${videoId}&format=json`
      const blog = session.blog;

      const content = blog?.data;

      const contentNew = content?.split('\n');

      const markdown = `
      ${contentNew.map((line: any) => {
            return `${line}\n`
      }).join('')}
      `


      const get = async () => {
            try {
                  const video = await axios.get(url);
                  setTitle(video.data.title);
            } catch (error) {
                  console.log(error)
            }
      }

      useEffect(() => {
            get()
      }, [])

      return (
            <Container maxW={{ base: 'xl', md: '2xl' }} mt={10}>
                  <Stack
                        as={Box}
                        textAlign={'center'}
                        spacing={{ base: 8, md: 14 }}
                        py={{ base: 12, md: 26 }}>
                        <Heading
                              fontWeight={600}
                              fontSize={{ base: 'lg', sm: 'md', md: '3xl' }}
                              lineHeight={'110%'}>
                              Video Title:
                              <Text fontWeight={700} color={"green.400"}> {title}</Text>
                        </Heading>
                        <ReactMarkdown components={ChakraUIRenderer()} children={markdown} />
                  </Stack>
            </Container>
      )
}

export default Blog
