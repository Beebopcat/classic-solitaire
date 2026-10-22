# Classic Solitaire

**Draw one or three, undo a move and bring all four suits home.**

[**▶ Live demo**](https://beebopcat.github.io/classic-solitaire/) · [**Play on caseyshingledecker.com**](https://caseyshingledecker.com/demos/top-secret/solitaire/) · [**Source**](https://github.com/Beebopcat/classic-solitaire)

[![Classic Solitaire promotional cover art.](docs/media/design-cover.webp)](https://beebopcat.github.io/classic-solitaire/)

*Promotional cover art; gameplay screenshots appear below.*

## What it is

Classic Klondike solitaire: draw one or three, undo a move and bring all four suits home.

## Screenshots

![The redesigned Classic Solitaire table: ivory cards, muted slate backs and four empty foundations on forest-green felt. Actual desktop gameplay.](docs/media/redesign-table-desktop.webp)

![Hint outlines the Ace of clubs and its foundation after a stock draw, while the waste pile and move counter remain visible. Actual desktop gameplay.](docs/media/redesign-hint-desktop.webp)

![The mobile table after moving the Ace of clubs to its foundation, leaving the first tableau column empty. Actual phone-size gameplay.](docs/media/redesign-foundation-phone.webp)

### Video

[![Actual Classic Solitaire gameplay recording.](docs/media/redesign-gameplay-poster.webp)](docs/media/redesign-gameplay.mp4)

*Silent browser recording: draw, Hint, a legal foundation move, Undo, draw-three mode and the rules dialog.*

## How to play

1. Build the four foundation piles from Ace to King by suit.
2. The seven columns build down in alternating colors; Kings fill empty columns.
3. Click or tap a face-up card and then its destination, drag it, or double-click a top card to send it to its foundation.
4. Click the stock to draw cards. The waste can be recycled with unlimited redeals.
5. Use the buttons: New deal, Undo, Hint, Finish game (when safe) and Draw 1 / Draw 3.

**Controls**

- Mouse or touch: click/tap a card then its destination, drag, or double-click a top card to send it to its foundation
- Keyboard: Tab to move between cards, Enter or Space to select, Escape to cancel, Ctrl+Z to undo

### Quick start

![The redesigned table at the start of a saved deal.](docs/media/redesign-table-desktop.webp)

## Features

- Draw 1 or Draw 3
- Undo
- Hint
- Finish game when safe
- Move counter and timer
- The game saves in the browser
- Keyboard accessible
- Unlimited redeals of the waste

## The story behind it

Part of Casey's Arcade. Some shuffled deals cannot be won, and the game says so.

## Built with

- HTML and JavaScript (solitaire.js)

## Run it locally

This is a static web project, so any local web server works:

```bash
git clone https://github.com/Beebopcat/classic-solitaire.git
cd classic-solitaire
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Credits & disclaimers

Built by Casey Shingledecker with AI-assisted development.

## More projects

- Portfolio and live demos: https://caseyshingledecker.com/
- All repositories: https://github.com/Beebopcat

## License

Copyright (c) 2026 Casey Shingledecker. All rights reserved. Source-available for viewing and for personal, non-commercial running only; this is not open source. See [LICENSE](LICENSE). Other people's material keeps its own license.
