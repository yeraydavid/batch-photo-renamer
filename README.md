#BATCH PHOTO RENAMER

A simple node script to homogenize the file names of some frequent devices and platforms (DSLR, Whatsapp, Smarthpone camera...)

By Yeray Rodriguez Dominguez, released under MIT license

## Current Transformations

IMG_20220123_whatever.jpg → IMG_2022-01-23_whatever.jpg
IMG_0001.jpg              → IMG_2022-01-23_0001.jpg (using the EXIF metadata creation date)
20220123_whatever.jpg     → IMG_2022-01-23_whatever.jpg
IMG-20220123-WA...jpg     → IMG_2022-01-23_WA...jpg
WhatsApp Image 2022-01... → IMG_2022-01-23_12-01-02.jpg 

## Requirements

Node.js

## How to use

- Download the repository
- Run *npm install*
- Execute with *node renamer.js <path with photos>
