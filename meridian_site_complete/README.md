# MERIDIAN

A mineral prospectivity engine for Guyana's interior, built for small-scale gold miners.

My dad is a gold miner in Guyana. The hardest part of his job is the gamble of evaluating land on foot, and the capital he loses when he guesses wrong. MERIDIAN tries to make that gamble smaller, and to keep the land safe while it does.

## What it does

- Splits Guyana's interior into 423,152 grid cells, each 500 meters across.
- Grades every cell with a simple letter, A through F, for gold.
- Gives each cell a clear next step instead of a raw score.
- Flags environmental hazards, such as a river within 1 km, and those flags always override the model's confidence. A high resource score can never hide a hazard.
- Shows the data source behind every claim on a cell's card, so nothing is a black box.
- Lets you save cells with notes, compare four sites side by side, and paste a list of survey coordinates to grade a whole batch.

## How it works

A gradient-boosted decision tree trained on nine spatial layers against 31,311 known deposit sites. I built the pipelines with Cursor and designed the card with Claude. I audited the river safety logic myself.

## Limits

MERIDIAN gives a high-confidence lead. It is not a physical survey and does not replace one.

If I had more time I would add biodiversity layers, bring in ground-truth assay samples, and build data-sovereignty tools so Indigenous communities can map sacred lands into the constraint engine.

## Run it

It is a static site. Open `index.html` through any web server, for example `python3 -m http.server`, or host the folder on GitHub Pages or Netlify.

Made by Shavanie for the Palantir Product Design Show & Tell, Lens A.
