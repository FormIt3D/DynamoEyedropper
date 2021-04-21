if (typeof DynamoEyedropper == 'undefined')
{
    DynamoEyedropper = {};
}

/*** application (FormIt-side) code only ***/

DynamoEyedropper.setDynamoData = function(args)
{

    var dynamoHistory = args.dynamoHistoryToModify;
    var GUIDsAndValuesObject = args.formattedGUIDsAndValuesObject;

    var message = "Applying changes in Dynamo...";
    FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
    
    FormIt.Dynamo.SetNodeValues(dynamoHistory, GUIDsAndValuesObject, false/*waitForDynamoEvaluationCompletedAndLoaded*/);
}