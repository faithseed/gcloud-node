/*!
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*!
 * @module compute/snapshot
 */

'use strict';

var nodeutil = require('util');

/**
 * @type {module:common/serviceObject}
 * @private
 */
var ServiceObject = require('../common/service-object.js');

/**
 * @type {module:common/util}
 * @private
 */
var util = require('../common/util.js');

/*! Developer Documentation
 *
 * @param {module:compute|module:compute/disk} scope - The parent scope this
 *     snapshot belongs to. If it's a Disk, we expose the `create` methods.
 * @param {string} name - Snapshot name.
 */
/**
 * A Snapshot object allows you to interact with a Google Compute Engine
 * snapshot.
 *
 * @resource [Snapshots Overview]{@link https://cloud.google.com/compute/docs/disks/persistent-disks#snapshots}
 * @resource [Snapshot Resource]{@link https://cloud.google.com/compute/docs/reference/v1/snapshots}
 *
 * @constructor
 * @alias module:compute/snapshot
 *
 * @example
 * var gcloud = require('gcloud')({
 *   keyFilename: '/path/to/keyfile.json',
 *   projectId: 'grape-spaceship-123'
 * });
 *
 * var gce = gcloud.compute();
 *
 * var snapshot = gce.snapshot('snapshot-name');
 *
 * //-
 * // Or, access through a disk.
 * //-
 * var disk = gce.zone('us-central1-a').disk('disk-name');
 * var snapshot = disk.snapshot('disk-snapshot-name');
 */
function Snapshot(scope, name) {
  var isDisk = scope.constructor.name === 'Disk';

  var methods = {
    /**
     * Check if the snapshot exists.
     *
     * @param {function} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this
     *     request.
     * @param {boolean} callback.exists - Whether the snapshot exists or not.
     *
     * @example
     * snapshot.exists(function(err, exists) {});
     */
    exists: true,

    /**
     * Get a snapshot if it exists.
     *
     * If you access this snapshot through a Disk object, this can be used as a
     * "get or create" method. Pass an object with `autoCreate` set to `true`.
     * Any extra configuration that is normally required for the `create` method
     * must be contained within this object as well.
     *
     * @param {options=} options - Configuration object.
     * @param {boolean} options.autoCreate - Automatically create the object if
     *     it does not exist. Default: `false`
     *
     * @example
     * snapshot.get(function(err, snapshot, apiResponse) {
     *   // `snapshot` is a Snapshot object.
     * });
     */
    get: true,

    /**
     * Get the snapshots's metadata.
     *
     * @resource [Snapshot Resource]{@link https://cloud.google.com/compute/docs/reference/v1/snapshots}
     * @resource [Snapshots: get API Documentation]{@link https://cloud.google.com/compute/docs/reference/v1/snapshots/get}
     *
     * @param {function=} callback - The callback function.
     * @param {?error} callback.err - An error returned while making this
     *     request.
     * @param {object} callback.metadata - The snapshot's metadata.
     * @param {object} callback.apiResponse - The full API response.
     *
     * @example
     * snapshot.getMetadata(function(err, metadata, apiResponse) {});
     */
    getMetadata: true
  };

  var config = {
    parent: scope,
    baseUrl: '/global/snapshots',
    id: name,
    methods: methods
  };

  if (isDisk) {
    config.createMethod = scope.createSnapshot.bind(scope);

    /**
     * Create a snapshot.
     *
     * **This is only available if you accessed this object through
     * {module:compute/disk#snapshot}.**
     *
     * @param {object} config - See {module:compute/disk#createSnapshot}.
     *
     * @example
     * snapshot.create(function(err, snapshot, operation, apiResponse) {
     *   // `snapshot` is a Snapshot object.
     *
     *   // `operation` is an Operation object that can be used to check the
     *   // status of the request.
     * });
     */
    config.methods.create = true;
  }

  ServiceObject.call(this, config);

  this.compute = isDisk ? scope.compute : scope;
  this.name = name;
}

nodeutil.inherits(Snapshot, ServiceObject);

/**
 * Delete the snapshot.
 *
 * @resource [Snapshots: delete API Documentation]{@link https://cloud.google.com/compute/docs/reference/v1/snapshots/delete}
 *
 * @param {function=} callback - The callback function.
 * @param {?error} callback.err - An error returned while making this request.
 * @param {module:compute/operation} callback.operation - An operation object
 *     that can be used to check the status of the request.
 * @param {object} callback.apiResponse - The full API response.
 *
 * @example
 * snapshot.delete(function(err, operation, apiResponse) {
 *   // `operation` is an Operation object that can be used to check the status
 *   // of the request.
 * });
 */
Snapshot.prototype.delete = function(callback) {
  callback = callback || util.noop;

  var compute = this.compute;

  ServiceObject.prototype.delete.call(this, function(err, resp) {
    if (err) {
      callback(err, null, resp);
      return;
    }

    var operation = compute.operation(resp.name);
    operation.metadata = resp;

    callback(null, operation, resp);
  });
};

module.exports = Snapshot;
