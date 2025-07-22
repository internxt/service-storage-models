const mongoose = require("mongoose");
const SchemaOptions = require("../options");

const storageTypes = ["hot", "cold"];

/**
 * Tracks file access and storage tiering
 * @constructor
 */
const FileState = new mongoose.Schema({
    bucketEntry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BucketEntry",
        required: true,
        unique: true,
    },
    storage: {
        type: String,
        enum: storageTypes,
        default: "hot",
        required: true,
        index: true,
    },
    lastAccessDate: {
        type: Date,
        required: true,
        index: true,
    },
    created: {
        type: Date,
        default: Date.now,
    },
});

FileState.index({ storage: 1, lastAccessDate: 1 });

FileState.plugin(SchemaOptions, {
    read: "secondaryPreferred",
});

/**
 * Updates last access time for a specific file
 * @param {ObjectId} bucketEntryId - BucketEntry id
 * @param {Date} accessDate - When the access occurred (defaults to now)
 * @returns {Promise<FileState|null>} - Returns null if record doesn't exist
 */
FileState.statics.updateLastAccessTime = async function (
    bucketEntryId,
    accessDate = new Date()
) {
    return this.findOneAndUpdate(
        { bucketEntry: bucketEntryId },
        { $set: { lastAccessDate: accessDate } },
        { new: true }
    );
};

module.exports = function (connection) {
    return connection.model("FileState", FileState);
};
