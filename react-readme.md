In this example, the Header Nav and the Megamenu are converted to React Components.
To communicate between React Components, we use a 200b library called [Mitt](https://github.com/developit/mitt), which allows us to set up an Event Bus for events to be fired/listened for between components.
In order to support JSX, we implement a simple Babel build process, started with the command `npm run babelwatch`.
We pass data to React in the same way that we're passing it to our Alpine Components - create a JSON tag, render its contents with Twig, parse it in our Component. See the `<script>` tag in `header.html.twig` for details.

# Notes and Limitations
This is a simple example just to demonstrate how you could use React in a Lightning theme- it isn't a full production-ready React Lightning theme. Some limitations to note:

## Alpine and React mixed
We are mixing Alpine and React here - The Header is still an Alpine component, but parts of its child tree are created/managed by React for this example. But it's not required that you use Alpine.js at all- this is just an example of it working. The React parts would work fine without Alpine.

## State Management
The Event Bus with Mitt is a simple and limited way to share state between React Components - in theory you could use a more robust state management solution like Redux or MobX, etc.
