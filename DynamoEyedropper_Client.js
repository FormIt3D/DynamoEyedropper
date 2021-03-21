if (typeof DynamoEyedropper == 'undefined')
{
    DynamoEyedropper = {};
}

/*** application (FormIt-side) code only ***/

DynamoEyedropper.setDynamoData = function(args)
{

    var dynamoHistory = args.dynamoHistoryToModify;
    var GUIDsAndValuesObject = args.formattedGUIDsAndValuesObject;

    var test = JSON.stringify(GUIDsAndValuesObject);
    
    FormIt.Dynamo.SetNodeValues(dynamoHistory, GUIDsAndValuesObject, false/*waitForDynamoEvaluationCompletedAndLoaded*/);
}