# Workflow Events Manager (WEM)
![Coverage lines](./coverage/badge-lines.svg)
![Coverage branches](./coverage/badge-branches.svg)
![Coverage functions](./coverage/badge-functions.svg)
![Coverage statements](./coverage/badge-statements.svg)

Flowbuild WEM in TS.

## Reference DOC:
https://dsd-fdte.atlassian.net/wiki/spaces/F/pages/63012865/Workflow+Events+Manager+WEM

## Run on your localhost:
* Setup:
```
pnpm i
pnpm run prepare
```
* Running:
```
pnpm run start:dev    # will run ts-node
```
or
```
pnpm run build
pnpm run start
```
## Running tests:
* Test scripts
```
pnpm run test
pnpm run test:cov
pnpm run test:badges
```

## App monitoring:
To get application behavior, you might use climem (reference: https://www.npmjs.com/package/climem)

There's a script already set up. Just run:
```
pnpm run start:climem
```

To see memory usage:
```
climem 8990 localhost
```