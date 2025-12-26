# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

`npm start`
Starts the development server.

`npm run build`
Bundles your website into static files for production.

`npm run serve`
Serves the built website locally.

We recommend that you begin by typing:

`cd asyncredux.com`
`npm start`

## Deploy

- To deploy, push to the `main` branch. CloudFlare will automatically deploy the website
  after a few seconds.

## Test on Android Simulator for Windows

- Open the terminal
- Type ipconfig and copy your `IPv4 Address`. For example, it could be `192.168.0.11`
- In your Docusaurus project's `docusaurus.config.js`, replace the `url` field:

  ```js
  // From:
  url: 'https://asyncredux.com',
  
  // To:
  url: 'http://192.168.0.11:3000',
  ```

- Now, to allow connections from other devices, you need to restart your development server  
  using this:

  ```bash
  npm run start -- --host 0.0.0.0
  ```

- After making these changes and starting your server with the new command, you should be able
  to access your Docusaurus site from your Android emulator by navigating to:

  ```url
  http://192.168.0.11:3000
  ```  
  
- Don't forget to undo the `url` change, back to:

  ```js
  url: 'https://asyncredux.com',
  ```
