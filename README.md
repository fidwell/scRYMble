# scRYMble

> Visit a release page on rateyourmusic.com and scrobble the songs you see!

scRYMble is a userscript for web browsers that allows you to scrobble songs to [last.fm](https://www.last.fm/) directly from [RateYourMusic](https://rateyourmusic.com/). If you like to listen on a record or CD player and still want to track your music habits, you can scrobble from any supported web browsers instead.

## Installation

I recommend using the [Violentmonkey](https://violentmonkey.github.io/) extension for user script management.

_To do: Add link to GreasyFork when it's available._

## Usage

Visit any release page on RateYourMusic (`https://rateyourmusic.com/release/*`) that has a tracklist. scRYMble will add scrobbling controls below the tracklist:

![image](https://github.com/fidwell/scRYMble/assets/5436387/c9331226-ed27-4e23-acde-9ec836f4195f)

Fill your last.fm username and password. You can also check and uncheck tracks you wish to scrobble or ignore.

### Scrobble in real time

If you want the page to scrobble along with you as you listen, click the "Scrobble in real time" button. scRYMble will start a timer for each track based on the listed duration, and submit the scrobble when the time is up. (If no duration is listed, a default of 3 minutes is used.)

### Scrobble a previous play

If you already finished listening to the release, click the "Scrobble in real time" button. You can then enter how long ago, in hours, you listened to the release. scRYMble will then submit all checked tracks in a batch. (You can submit fractional hours, too; for example, enter `0.5` for half an hour ago.)

## About

scRYMble was created by [bluetshirt](https://rateyourmusic.com/~bluetshirt) in 2009 with assistance from various RYM community members.

### Credits

- Original author: bluetshirt
- Name: lynkali 
- Useful tweaks and bug fixes: fidwell, AnniesBoobs, BruceWayne, actually, Kronz, Carcinogeneration

## For developers: How to build

1. Install the latest version of [Node](https://nodejs.org/en/) and make sure to include NPM in the installation options.
2. Clone the project to a location of your choice on your PC.
3. Open a command prompt, use `cd` to change your current directory to the root folder of this project, and run `npm install`.
4. Run `npm run build` to build the project. Compiled and minified .js files will be added to the `dist` folder. You can paste the contents of those files into your script manager extension.

You can also use `npm run lint` to just run the linter to find style errors, or `npm run lint-fix` to fix them where possible.
