import { isNumber } from 'util';

const logFlag = (process.env.NODE_ENV == 'development') ? true : false;

const util = require('util');
const mongoose = require('mongoose');
const Freeboard = mongoose.model('Freeboard');
const apiHelper = require('../../../../services/api-helper');

exports.findById = function (req, res, next, id) {
    id = parseInt(id);
    req.id = id;

    if (!isNumber(id)) return res.status(400).send();

    Freeboard.findOne({ _id: id }).then(result => {
        if (!result) return sendResourceNotFound(res, 'freeboard', id);
        req.freeboard = result;
        return next();
    }, reason => {
        return sendInternalError(res, reason);
    })
}

exports.save = function (req, res, next) {

    if (req.body == null) res.status(404).json({ err: 'bad_request' });
    const user = req.user;
    const title = req.body.title;
    const content = req.body.content; //TODO: vaild foramt check ops, file size
    const text = req.body.text;

    if (title == "error") res.status(404).json({ err: 'test error' });

    new Freeboard({ title: title, content: content, text: text, owner: user }).save().then(result => {
        res.json(result);
    }, reason => {
        const code = reason.code || 500;
        if (code == 500) {
            if (logFlag) console.log(reason);
            sendInternalError(reason);
            res.status(500).json({ errMsg: 'internal_server_error', reason: reason });
        } else {
            res.status(code).json({ errors: reason.errors });
        }
    })
}

exports.read = function (req, res, next) {

    // variables extraction
    const freeboard = req.freeboard;
    const id = req.freeboard._id;

    const populateQuery = [];

    // populate user 
    populateQuery.push({
        path: 'owner',
        select: ['-email', '-password', '-battletag'],
    });

    // populate comments
    populateQuery.push({
        path: 'comments',
        populate: { // nested populate
            path: 'owner',
            model: 'User',
            select: ['-email', '-password', '-battletag'],
        }
    });

    Freeboard.findOne({ _id: id })
        .populate(populateQuery)
        .exec()
        .then(result => {
            res.json(result);
        }, reason => {
            sendInternalError(res, reason);
        });

    // freeboard.update({ $inc: { viewCount: 1 } }, function (err) {
    //     res.json(freeboard);
    // });
}

exports.getPageQuery = function (req, res, next) {

    // variables extraction
    const pageNum = parseInt(req.query.page);
    const keyword = req.query.keyword;
    const limit = 10;

    // validate check
    if (!isNumber(pageNum)) return res.status(404).send();

    // prepare query
    const query = {};
    if (keyword) query.$text = { $search: keyword, $diacriticSensitive: true };

    // querying
    Freeboard
        .find(query, { content: 0, comments: 0 })
        .sort({ _id: -1 })
        .skip((pageNum - 1) * limit)
        .limit(limit)
        .populate({
            path: 'owner',
            model: 'User',
            select: ['email', 'userName'],
        })
        .then(result => {
            res.json(result);
        }, reason => {
            res.status(500).send({ errMsg: "internal_server_error", errLog: reason });
        });

}

exports.upvote = function (req, res) {

    // check auth
    // freeboard upvote user list... user id save
    const user = req.user;
    const freeboard = req.freeboard;

    const userId = user._id;
    const freeboardId = freeboard._id;
    const upvoteUsers = freeboard.upvoteUsers

    if (!freeboard) return sendResourceNotFound(res, 'freeboard', freeboardId);

    // check already upvote
    const isAlreadyUpvote = upvoteUsers.some(function (upvoteUser) {
        return upvoteUser.equals(userId);
    })
    if (isAlreadyUpvote) return res.status(409).json({ errMsg: 'freeboard_already_upvote', errLog: `already upvote in freeboard(${freeboardId})` });

    freeboard.upvoteUsers.push(user);
    freeboard.upvoteUserCount = freeboard.upvoteUsers.length;

    freeboard.save().then(result => {
        res.json({ result: true, msg: 'freeboard_upvote_success' });
    }, reason => {
        sendInternalError(res, reason);
    });
}

function sendResourceNotFound(res, resourceName, resourceId) {
    res.status(404).json({ errMsg: `${resourceName}_is_not_existed`, errLog: `can not find ${resourceName}(${resourceId})` });
}

function sendInternalError(res, reason) {
    res.status(500).json({ errMsg: 'internal_server_error', errLog: reason });
}
