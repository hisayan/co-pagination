/** File Name: node_modules/railway-pagination/index.js
* Purpose: railway-pagination main file.
* Original author: Anatoliy C.
*
* Update History
* Name            Date       Description
* --------------- ---------- ------------------------------------------------------------------------------
* Asp3ctus        14/03/2013 - Migrate to compund and new jugglingdb api
* Jude L.         04/26/2012 - Updated the paginateCollection to allow the passing of order option to the Model.all routine.
* Jude L.         05/19/2012 - Updated the paginateCollection to allow the passing of where option to the Model.all routine
                              if one is provided.
**/

exports.init = function (compound) {
    // add view helper
    compound.helpers.HelperSet.prototype.paginate = paginateHelper;
    // add orm method
    // sorry, jugglingdb only for now
    compound.on('models', function(){
        for(var m in compound.models){
            if(compound.models.hasOwnProperty(m)){
                compound.models[m].paginate = paginateCollection;
            }
        }

    });
};

// global view helper
function paginateHelper(collection, step, query) {
    if (!query) {
        query = "?page=";
    } else {
        query += "&page=";
    }

    if (!step) step = 5;
    if (!collection.totalPages || collection.totalPages < 2) return '';
    var page = parseInt(collection.currentPage, 10);
    var pages = collection.totalPages;
    var html = '<div class="pagination">';

    html += '<ul>';
    if (page === 1) {
        html += '<li class="disabled"><span>&laquo;</span></li>';
        html += '<li class="disabled"><span>&lsaquo;</span></li>';
    } else {
        html += '<li class="">' + this.link_to('&laquo;', query + '1') + '</li>';
        html += '<li class="">' + this.link_to('&lsaquo;', query + (page - 1)) + '</li>';
    }

    var start = page - step;
    var end = page + step;

    if ((step * 2 + 1) >= collection.totalPages) {
        start = 1;
        end = collection.totalPages;
    } else {
        console.log(start,end);
        if (start < 1) {
            end += (1 - start);
            start = 1;
        }
        if (end > collection.totalPages) {
            start -= (end - collection.totalPages);
            end = collection.totalPages;
        }
    }

    for (var i = start; i <= end; i++ ) {
        if (i == page) {
            html += '<li class="active"><span>' + i + '</span></li>';
        } else {
            html += '<li>' + this.link_to(i, query + i) + '</li>';
        }
    }

    if (page === pages) {
        html += '<li class="disabled"><span>&rsaquo;</span></li>';
        html += '<li class="disabled"><span>&raquo;</span></li>';
    } else {
        html += '<li class="">' + this.link_to('&rsaquo;', query + (page + 1)) + '</li>';
        html += '<li class="">' + this.link_to('&raquo;', query + pages) + '</li>';
    }

    html += '</ul></div>';
    return html;
};

// orm method
function paginateCollection(opts, callback) {
    var limit   = opts.limit   || 10;
    var page    = opts.page    || 1;
    var order   = opts.order   ||'1';
    var where   = opts.where;
    var include = opts.include;
    var Model = this;

    if (where != null) {
        Model.count(where, function (err, totalRecords) {
            Model.all({limit: limit, offset: (page - 1) * limit, order: order, where: where, include: include}, function (err, records) {
                if (err) return callback(err);
                records.totalRecords = totalRecords;
                records.currentPage = page;
                records.totalPages = Math.ceil(totalRecords / limit);
                callback(null, records);
            });
        })
    } else {
        Model.count(function (err, totalRecords) {
            Model.all({limit: limit, offset: (page - 1) * limit, order: order, include: include }, function (err, records) {
                if (err) return callback(err);
                records.totalRecords = totalRecords;
                records.currentPage = page;
                records.totalPages = Math.ceil(totalRecords / limit);
                callback(null, records);
            });
        })
    }

}
