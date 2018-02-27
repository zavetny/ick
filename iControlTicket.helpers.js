var kelloggsIc = kelloggsIc || {};
kelloggsIc.helpers = kelloggsIc.helpers || {};

kelloggsIc.helpers.addItem = (function () {
    return {
        execute: function (targetListName, fieldsArray, dataArray) {
            var deferred = $.Deferred();

            var clientContext = new SP.ClientContext.get_current();
            var targetList = clientContext.get_web().get_lists().getByTitle(targetListName);
        
            var itemCreateInfo = new SP.ListItemCreationInformation();
            var listItem = targetList.addItem(itemCreateInfo);

            fieldsArray.forEach(function(value, index){
                listItem.set_item(value, dataArray[index]);
            });
        
            listItem.update();
            clientContext.executeQueryAsync(function (sender, args) {
                if (listItem) {
                    deferred.resolve(listItem.get_id());
                }
            }, function (sender, args) {
                console.warn("kelloggsIc.helpers.addItem err: " + args.get_message());
                deferred.reject();
            });
        
            return deferred.promise();
        }
    };
})();

kelloggsIc.helpers.updateItemByQuery = (function () {
    return {
        execute: function (targetListName, queryTemplateName, params, includeDirective, fieldsArray, dataArray) {
            var deferred = $.Deferred();

            var clientContext = new SP.ClientContext.get_current();
            var targetList = clientContext.get_web().get_lists().getByTitle(targetListName);

            var camlQuery = new SP.CamlQuery();
            var queryTemplate = Handlebars.compile($("#"+ queryTemplateName).html());
            var queryText = queryTemplate(params);
            queryText = queryText.replace(/(?:\r\n|\r|\n|\t)/g, '');
            camlQuery.set_viewXml(queryText);

            var results = targetList.getItems(camlQuery);
            if (includeDirective) {
                clientContext.load(results, includeDirective);
            }
            else {
                clientContext.load(results);
            }
            clientContext.executeQueryAsync(function (sender, args) {
                if (results) {
                    var listItemEnumerator = results.getEnumerator();
                    while (listItemEnumerator.moveNext()) {
                        var listItem = listItemEnumerator.get_current();

                        fieldsArray.forEach(function (value, index) {
                            listItem.set_item(value, dataArray[index]);
                        });
                        listItem.update();
                        clientContext.executeQueryAsync(function (sender, args) {
                            if (listItem) {
                                deferred.resolve(results);//mantis: what if more than 1?
                            }
                        }, function (sender, args) {
                            console.warn("kelloggsIc.helpers.updateItemByQuery - update: " + args.get_message());
                            //deferred.reject();
                        });
                    }
                }
            }, function (sender, args) {
                console.warn("kelloggsIc.helpers.addItem err: " + args.get_message());
                deferred.reject();
            });

            return deferred.promise();
        }
    };
})();


kelloggsIc.helpers.updateItemById = (function () {
    return {
        execute: function (targetListName, id, fieldsArray, dataArray) {
            var deferred = $.Deferred();

            var clientContext = new SP.ClientContext.get_current();
            var targetList = clientContext.get_web().get_lists().getByTitle(targetListName);

            var listItem = targetList.getItemById(id);

            clientContext.load(listItem);
            clientContext.executeQueryAsync(function (sender, args) {
                if (listItem) {
                    fieldsArray.forEach(function (value, index) {
                        listItem.set_item(value, dataArray[index]);
                    });

                    listItem.update();
                    clientContext.executeQueryAsync(function (sender, args) {
                        if (listItem) {
                            deferred.resolve(listItem.get_id());
                        }
                    }, function (sender, args) {
                        console.warn("kelloggsIc.helpers.updateItemById - update: " + args.get_message());
                        deferred.reject();
                    });
                }
            }, function (sender, args) {
                console.warn("kelloggsIc.helpers.updateItemById err: " + args.get_message());
                deferred.reject();
            });

            return deferred.promise();
        }
    };
})();


kelloggsIc.helpers.getItemsByQuery = (function () {
    return {
        execute: function (targetListName, queryTemplateName, params, includeDirective) {
            var deferred = $.Deferred();

            var clientContext = new SP.ClientContext.get_current();
            var targetList = clientContext.get_web().get_lists().getByTitle(targetListName);

            var camlQuery = new SP.CamlQuery();
            var queryTemplate = Handlebars.compile($("#" + queryTemplateName).html());
            var queryText = queryTemplate(params);
            queryText = queryText.replace(/(?:\r\n|\r|\n|\t)/g, '');
            camlQuery.set_viewXml(queryText);

            var results = targetList.getItems(camlQuery);
            clientContext.load(results, includeDirective);
            clientContext.executeQueryAsync(function (sender, args) {
                if (results) {
                    deferred.resolve(results);
                }
            }, function (sender, args) {
                console.warn("kelloggsIc.helpers.addItem err: " + args.get_message());
                deferred.reject();
            });

            return deferred.promise();
        }
    };
})();

