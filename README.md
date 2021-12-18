<img src="assets/jswind.png" width="200"/>

# JSWind

🪟 Create desktop windows in node.js

✏️ Easy to use

## Install

In your command line, run:

```bash
$ npm install jswind
```

## Use

In your JavaScript file, require jswind like so:

```js
const DesktopWindow = require("jswind");
```

`DesktopWindow` is a class that creates, you guessed it, desktop windows. Create one by creating a new instance of `DesktopWindow` and adding a control function, and an optional title:

```js
const window = new DesktopWindow({
  control: () => {
    alert("Hello World!");
  },
  title: "Hello From Node.js",
});
```

you will get something like this:

<img src="assets/example1.png" />

You can also create a new file and use that as the control:

```js
const window = new DesktopWindow({
  control: "path/to/file",
});
```

The control function is like JavaScript running in the browser, you have full access to the dom. But what if you want to write a file, or create an http server?

### Events

You can create events for the window that can be triggered from inside the control function. To create an event, run this function from your `DesktopWindow` instance:

```js
window.addEvent("Event Name", function callback(argument) {});
```

Then to run an event, in the control function use the function:

```js
eventSend("Event Name", argument);
```

In my case, I will create a file titled `text.txt` that says:

```txt
I am a text file!
```

Then I will create the following code to alert the text in the file:

```js
const DesktopWindow = require("jswind");
const { readFileSync } = require("fs");

const window = new DesktopWindow({
  control: async () => {
    const text = await eventSend("getText");
    alert(text);
  },
});

window.addEvent("getText", () => {
  return readFileSync("text.txt", "utf-8");
});
```

Then when I run the file, I'll get:

<img src="assets/example2.png" />

You can also use built in events from outside of this window using `.on`:

```js
window.on("event", function callback() {});
```

<table>
  <tr>
    <th>Events</th>
  </tr>
  <tr>
    <td><code>close</code></td>
    <td>When the window closes, can exit the process by adding <code>DesktopWindow.EXIT_ON_CLOSE</code></td>
  </tr>
</table>

### imports

Because of code above the normal function, imports aren't added inside the control function. Instead they are an optional argument:

```js
new DesktopWindow({
  control: () => {},
  title: "JSWind",
  imports: [
    {
      import: "{ value }",
      from: "script",
    },
    {
      import: "script",
    },
  ],
});

// import { value } from "script";
// import "script";
```

Just remember that the `from` is from the root directory where the `node_modules` folder is.

### Executables (pkg)

You can create a JSWind project by running jswind on `npx`:

```bash
$ npx jswind
```

You should have a directory like this:

```
> instances
> jswind
> src
# .gitignore
# index.js
# package.json
```

Start your code in `index.js`. Everything works the same accept for a few things:

- you can only use a filepath for the control function in `DesktopWindow`. _this is because `Function.toString()` in an executable will turn into `"[ native code ]"`_

- The import base directory will be the `src` file.

You can run the pkg script to turn the project into an executable:

```bash
$ npm run pkg
```
