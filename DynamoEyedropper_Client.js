if (typeof DynamoEyedropper == 'undefined')
{
    DynamoEyedropper = {};
}

/*** application (FormIt-side) code only ***/

DynamoEyedropper.setDynamoData = function(args)
{
    //var exampleNodeValue =  {"de5606a8c730408c95bd985418cb98d3": 20.0};
    
    FormIt.Dynamo.SetNodeValues(args.dynamoHistoryToModify, args.formattedGUIDsAndValuesObject, false/*waitForDynamoEvaluationCompletedAndLoaded*/);
}