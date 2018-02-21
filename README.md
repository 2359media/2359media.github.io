# 2359 Media Engineering Blog

This blog uses a static site generator [Hexo](https://hexo.io) and Github Pages. To contribute, please refer to the instructions below

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Install nodejs You may find an installer for your operating system [here](https://nodejs.org/en/download/).

Install hexo.
```
npm install hexo-cli -g
```
### Installing

Now that you have the prerequisite softwares, follow the steps below to set up this project in your local machine.

Clone this repository

```
$ git clone git@github.com:2359media/2359media.github.io.git
```

Install dependencies

```
$ cd 2359media.github.io
$ npm install
```

Check that you are able to run the project
```
$ hexo server
# Open a web browser and go to http://localhost:4000. You should be able to see the blog
```
## Contributing
### Creating a new post

Create a new branch with the post name
```
$ git checkout -b how-to-be-awesome-in-ios
```

Run the following command to generate a new post
```
$ hexo new post how-to-be-awesome-in-ios
# A new file called 'how-to-be-awesome-in-ios.md' will be created in /source/_post
```

### Writing your article

The article can be written using markdown syntax. You may refer to this [website](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet) for reference.

### Pushing your change

When you are done writing your article, commit your changes and push to Github.

On Github, create a pull request to merge your code to `source` branch.

## Deployment

Deployment will only be done by the platform leads. Follow the instruction below to deploy the latest changes to the website.

Pull the latest change in `source` branch
```
$ git checkout source
$ git pull
```

Clean cache and public folder
```
$ hexo clean
```

Deploy!
```
$ hexo deploy
```

Add additional notes about how to deploy this on a live system

## Built With

* [Hexo](https://hexo.io) - The static site generator
* [Light](https://hexo.io/hexo-theme-light/) - Theme used