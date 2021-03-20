if (typeof DynamoEyedropper == 'undefined')
{
    DynamoEyedropper = {};
}

/*** application (FormIt-side) code only ***/

DynamoEyedropper.setDynamoData = function(args)
{
    //var exampleNodeValue =  {"de5606a8c730408c95bd985418cb98d3": 20.0};
    //var twoInputNodeValues = [{ "guid" : value}, {"guid : value }];

    var dynamoHistory = args.dynamoHistoryToModify;
    var GUIDsAndValuesObject = args.formattedGUIDsAndValuesObject;
    
    FormIt.Dynamo.SetNodeValues(dynamoHistory, GUIDsAndValuesObject, false/*waitForDynamoEvaluationCompletedAndLoaded*/);
}