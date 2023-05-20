import ReactMarkdown from 'react-markdown'
import { Box, Container, Heading, Stack } from '@chakra-ui/react'
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';


const markdown = `
# Building an App with Custom Machine Learning Model: A Beginner's Guide

In this three-part tutorial series, we'll explore how to create a simple iOS app that utilizes a custom machine learning model to classify actions in real-time video data. Even with minimal knowledge of machine learning and basic understanding of Swift app development, you can follow along and create your own app.

## Table of Contents
- Introduction
- Part 1: Creating a Custom Classifier with Create ML
- Part 2: Streaming Camera Data to the App
- Part 3: Using the Classifier to Classify Actions

## Introduction
The tutorial begins by demonstrating the possibilities for creating an app that uses machine learning to classify actions. The author showcases a basic iOS app that classifies throwing motions and suggests other ideas like determining the pitch count in a baseball game. The aim of the tutorial is to provide a starting point for those interested in exploring machine learning without diving deep into complex coding.

## Part 1: Creating a Custom Classifier with Create ML
The first part focuses on using Create ML, an app available on macOS, to build a custom classifier. Create ML offers various classifier options, and for this tutorial, the author chooses the action classification model. This model uses the Vision framework to detect human body poses in videos and classify actions based on those poses.

The process begins by creating a new project in Create ML and organizing the training data. The training data consists of labeled videos, with each action category placed in separate subfolders. The author emphasizes the importance of having a diverse dataset with different angles, stable footage, and clear contrast between the person and the background.

After setting up the dataset, the Create ML app provides options to configure parameters such as frame rate, action duration, augmentation, validation data, and testing data. These settings allow customization based on the specific requirements of the app and dataset.

Once the configuration is complete, the training process begins, and the model goes through multiple iterations to learn from the provided data. The author discusses the importance of having a well-prepared dataset and how it affects the model's accuracy.

## Part 2: Streaming Camera Data to the App
In the second part, the tutorial covers the process of streaming live video data from the device's camera to the app. This step requires understanding AV Foundation and involves previewing the camera feed on the device. The author guides users through the necessary steps to implement this functionality in their app.

## Part 3: Using the Classifier to Classify Actions
The final part focuses on utilizing the custom classifier created in Part 1 to classify actions in the live video stream. The author demonstrates how to integrate the classifier into the app and use it to determine if a throwing motion is detected or not. The app processes one-second chunks of video data and provides a real-time classification result.

## Conclusion
The tutorial series provides a beginner-friendly guide to creating an app that utilizes a custom machine learning model to classify actions in live video data. By following the step-by-step instructions and understanding the key concepts, even those with minimal machine learning knowledge and basic Swift app development skills can build their own app. The tutorial emphasizes the importance of dataset preparation, parameter configuration, and testing to achieve accurate results.

`

const Blog = () => {

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
                              Your Generated Youtube Video Blog Post
                        </Heading>

                        <ReactMarkdown components={ChakraUIRenderer()} children={markdown} />



                  </Stack>
            </Container>
      )
}

export default Blog
