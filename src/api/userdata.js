const express = require("express");
const bodyParser = require("body-parser");
const isAuth = require("../../routes/auth/isauth");
const randomstring = require("randomstring");
const axios = require('axios');
const UserDetail = require("../models/userDetails");
const findAge = require("../middleware/findage");
const distanceInKmBetweenEarthCoordinates = require("../middleware/finddistance");
const User = require("../models/userauth");

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true
}));

router.post("/userpic", async (req, res) => {
    try {
        //authenticating user
        const user = await isAuth(req);

        //getting users data
        const getdata = async () => {
            let data = await UserDetail.aggregate([{ $match: { _id: { $ne: user._id } } },
            { $sample: { size: 1 } }]).exec();
            let userdata = data[0];
            if (userdata._id != user.id) {
                const imgurl = "/uploads/" + userdata.userprofileimage.path;

                //getting our coordinates from database
                const mycoordinates = await UserDetail.findOne({ _id: user._id }).select({ location: 1 });

                //getting userAge
                const age = await findAge(userdata._id);

                //getting verification of the user
                const data2 = await User.findOne({ _id: userdata._id }).select({ verify: 1 });
                const verify = data2.verify;


                //getting distance
                const distance = await distanceInKmBetweenEarthCoordinates(mycoordinates.location.lat, mycoordinates.location.lon, userdata.location.lat, userdata.location.lon);
                const resultobject = {
                    imgurl: imgurl,
                    userid: userdata._id,
                    name: userdata.moreDetail.name,
                    age: age,
                    distance: distance,
                    verify: verify
                }
                res.send(JSON.stringify(resultobject));
            } else {
                getdata();
            }
        }
        getdata();

    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.post("/likeuser", async (req, res) => {
    try {
        //authenticating user
        const user = await isAuth(req);

        console.log("hello");
        //getting liked user data
        const likedUserId = req.body.userid;
        await UserDetail.findOneAndUpdate({ _id: user._id }, { $addToSet: { likedUser: likedUserId } });

        //getting my name 
        const data = await UserDetail.findOne({ _id: user._id }).select({ moreDetail: { name: 1 } });
        const myname = data.moreDetail.name;

        //cross checking the like in liked user
        const otherUser = await UserDetail.findOne({ _id: likedUserId }).select({ likedUser: 1, moreDetail: { name: 1 } });
        const otherusername = otherUser.moreDetail.name;
        const otherUserlikedlist = otherUser.likedUser.find(element => element == user._id);
        if (otherUserlikedlist) {
            const message = {
                message: "congratulations you get a new match with someone check your Match box now !!!!",
                isviewed: false
            }
            const roomId = randomstring.generate(30) + Date.now();
            await UserDetail.findOneAndUpdate({ _id: likedUserId }, { $addToSet: { matches: { userId: user._id, name: myname, roomId: roomId } }, $push: { messages: message } });
            await UserDetail.findOneAndUpdate({ _id: user._id }, { $addToSet: { matches: { userId: likedUserId, name: otherusername, roomId: roomId } }, $push: { messages: message } });
        }

        const result = {
            status: 200
        }
        res.send(result);


    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.post("/superlikeuser", async (req, res) => {
    try {
        //authenticating user
        const user = await isAuth(req);

        //getting superlikes data
        const sId = req.body.userid;

        //getting the name of the user
        const data = await UserDetail.findOne({ _id: user._id }).select({ moreDetail: { name: 1 }, suscribed: 1 });
        if (data.suscribed) {
            const name = data.moreDetail.name;

            //creating a message for the user
            const message = {
                message: name + " likes your profile",
                user: user._id,
                isviewed: false
            }
            await UserDetail.findOneAndUpdate({ _id: sId }, { $addToSet: { superlikes: user._id }, $push: { messages: message } });

            const result = {
                status: 200
            }
            res.send(result);
        } else {
            const result = {
                msg: "not a suscribed user",
                status: 404,
            }
            res.send(result);
        }


    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

router.post("/saveuser", async (req, res) => {
    try {
        //authenticating user
        const user = await isAuth(req);

        //getting liked user data
        const saveUserId = req.body.userid;
        const viewedUsers = await UserDetail.findOneAndUpdate({ _id: user._id }, { $addToSet: { viewedUser: saveUserId } });

        const result = {
            status: 200
        }
        res.send(result);

    } catch (error) {
        console.log(error);
        res.send(error);
    }
});


router.post("/getprevioususer", async (req, res) => {
    try {
        //authenticating user
        const user = await isAuth(req);

        //getting previous user seen
        const data = await UserDetail.findOne({ _id: user._id }).select({ viewedUser: { $slice: -1 }, suscribed: 1 });
        if (data.viewedUser && data.suscribed) {
            const prevUser = data.viewedUser[0];

            //deleting the previous user
            await UserDetail.updateOne({ _id: user._id }, { $pop: { viewedUser: 1 } });

            //getting users data
            const userdata = await UserDetail.findOne({ _id: prevUser });
            const imgurl = "/uploads/" + userdata.userprofileimage.path;

            //getting our coordinates from database
            const mycoordinates = await UserDetail.findOne({ _id: user._id }).select({ location: 1 });

            //getting userAge
            const age = await findAge(userdata._id);

            //getting distance
            const distance = await distanceInKmBetweenEarthCoordinates(mycoordinates.location.lat, mycoordinates.location.lon, userdata.location.lat, userdata.location.lon);

            const resultobject = {
                imgurl: imgurl,
                userid: userdata._id,
                name: userdata.moreDetail.name,
                age: age,
                distance: distance
            }
            res.send(JSON.stringify(resultobject));
        }
        else {
            const result = {
                msg: "Bad request",
                status: 404,
            }
            res.send(JSON.stringify(result));
        }

    } catch (error) {
        console.log(error);
        res.send(error);
    }
});


module.exports = router;