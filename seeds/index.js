const mongoose = require('mongoose');
const Campground = require('../models/campground');

const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('Database connected'));

// GET RANDOM ELEMENT FROM ARRAY
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Add 50 random places using random data from cities.js and seedHelpers.js
const seedDB = async () => {
   await Campground.deleteMany({});
   for (let i = 0; i < 300; i++) {
      const random1000 = Math.floor(Math.random() * 1000);
      const price = Math.floor(Math.random() * 20) + 10;
      const camp = new Campground({
         author: '613123277adaefc35756317a',
         location: `${cities[random1000].city}, ${cities[random1000].state}`,
         title: `${sample(descriptors)} ${sample(places)}`,
         description:
            'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ipsam doloremque quod laudantium quisquam. Labore sequi veritatis harum aliquid, excepturi consequuntur rerum! Placeat iste nobis accusamus. Ut nostrum aperiam reprehenderit velit?',
         price: price,
         geometry: {
            type: 'Point',
            coordinates: [
               cities[random1000].longitude,
               cities[random1000].latitude,
            ],
         },
         images: [
            {
               url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ahfnenvca4tha00h2ubt.png',
               filename: 'YelpCamp/ahfnenvca4tha00h2ubt',
            },
            {
               url: 'https://res.cloudinary.com/douqbebwk/image/upload/v1600060601/YelpCamp/ruyoaxgf72nzpi4y6cdi.png',
               filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi',
            },
         ],
      });
      await camp.save();
   }
};

seedDB().then(() => mongoose.connection.close());
