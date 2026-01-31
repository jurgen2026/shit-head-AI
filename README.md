The aim of this project is to produce an AI that can play shithead to a competant level and can be plugged into
the react project to play against other humans.

This could even be the first games we ever play as they can just be run locally and don't need a server.

### === TASKS ===

1) Finish the game logic (blinds, face ups, game loop and game over)

2) Look into the best way to run this new version of the game in order to test against AIs. Creating a repl seems to be an early frontrunner so I need to look into that more.

3) Start planning the AI itself (first I build the rules based AI, then the machine learning based AI)



### === THE GAME CONSOLE ===

 The game console is what has replaced the react UI for this AI project. As a result instead of rendering graphic we only have to render text to represent what's going on. As a result the user must play the game through inputs which are designed to be architectually coherent with the future plans of reintegrating this with the react version (aka the AI will work in that).

 #### === INPUT VALIDATION ===

The way we validate the users inputs will set us up perfectly for when the UI is introduced as before the input function is even called we call another function to generate all possible inputs the user has available to them in that moment. This list is passed through to the input function which 


