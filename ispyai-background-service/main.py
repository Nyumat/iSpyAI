import os


def main():
    print("Hello there")
    # print env variables
    print(f"env variable userId: {os.environ.get('userId')}")
    print(f"env variable videoUrl: {os.environ.get('videoUrl')}")

if __name__ == '__main__':
    main()