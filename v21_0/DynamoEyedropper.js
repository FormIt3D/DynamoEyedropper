if (typeof DynamoEyedropper == 'undefined')
{
    DynamoEyedropper = {};
}

/*** web/UI code - runs natively in the plugin process ***/

// flag to indicate a selection is in progress
let bIsSelectionForMatchInProgress = false;
let bIsSelectionForChangeInProgress = false;

// IDs input elements that need to be referenced or updated
// match object section
const dynamoObjectToMatchDescriptionID = 'dynamoObjectToMatchDescription';
const dynamoObjectToMatchGroupNameID = 'dynamoObjectToMatchGroupName';
const dynamoObjectToMatchInputCountID = 'dynamoObjectToMatchInputCount';
// change object section
const dynamoObjectToChangeDescriptionID = 'dynamoObjectToChangeDescription';
const dynamoObjectToChangeGroupNameID = 'dynamoObjectToChangeGroupName';
const dynamoObjectToChangeInputCountID = 'dynamoObjectToChangeInputCount';
// review and apply section
const missingSelectionsDivID = 'noSelectionsDiv';
const incompatibleSelectionDivID = 'incompatibleSelectionDiv';
const identicalInputsDivID = 'identicalInputsDiv';
const reviewAndApplyDetailsDivID = 'reviewAndApplySection';
const affectedInputsCountID = 'affectedInputsCount';
const affectedInputsListID = 'affectedInputsList';

const selectionMessagePrefixText = 'Select a Dynamo object ';
DynamoEyedropper.selectionSuccessMessageText = 'Selection received!'
DynamoEyedropper.selectionFailureMessageText = 'The selection must be a Dynamo Group instance. \nTry again, and select a Dynamo Group instance when prompted.'
const objectIDPrefixText = 'Dynamo History ID: ';
const groupNamePrefixText = 'Dynamo Group Name: ';
const inputCountPrefixText = 'Input Nodes: ';
const affectedInputsPrefixText = 'Inputs to be modified: ';
const affectedInputsListPrefixText = 'Names and values: \n';
const objectIDSelectingText = 'Selecting...';
const notSetText = '(not set)';

DynamoEyedropper.initializeUI = async function()
{
    // create an overall container for all objects that comprise the "content" of the plugin
    // everything except the footer
    let contentContainer = document.createElement('div');
    contentContainer.id = 'contentContainer';
    contentContainer.className = 'contentContainer'
    contentContainer.style.overflowY = 'scroll';
    window.document.body.appendChild(contentContainer);

    // create the header
    contentContainer.appendChild(new FormIt.PluginUI.HeaderModule('Dynamo Eyedropper', 'Apply input values when possible between two Dynamo objects.').element);

    /* object to match */

    // create the object to match subheader
    let dynamoObjectToMatchSubheader = contentContainer.appendChild(document.createElement('p'));
    dynamoObjectToMatchSubheader.style = 'font-weight: bold;'
    dynamoObjectToMatchSubheader.innerHTML = 'Dynamo Object to Match';
    
    // the description of the object to match
    let dynamoObjectToMatchTitleDiv = document.createElement('div');
    dynamoObjectToMatchTitleDiv.innerHTML = notSetText;
    dynamoObjectToMatchTitleDiv.id = dynamoObjectToMatchDescriptionID;
    contentContainer.appendChild(dynamoObjectToMatchTitleDiv);

    // the name of the object to match
    let dynamoObjectToMatchNameDiv = document.createElement('div');
    dynamoObjectToMatchNameDiv.innerHTML = '';
    dynamoObjectToMatchNameDiv.id = dynamoObjectToMatchGroupNameID;
    contentContainer.appendChild(dynamoObjectToMatchNameDiv);

    // the input count
    let dynamoObjectToMatchInputCountDiv = document.createElement('div');
    dynamoObjectToMatchInputCountDiv.innerHTML = '';
    dynamoObjectToMatchInputCountDiv.id = dynamoObjectToMatchInputCountID;
    contentContainer.appendChild(dynamoObjectToMatchInputCountDiv);

    // create the button to select the object to match
    contentContainer.appendChild(new FormIt.PluginUI.Button('Select Dynamo Object to Match', DynamoEyedropper.getDynamoInputsToMatch).element);

    /* object to change */

    // create the object to change subheader
    let dynamoObjectToChangeSubHeader = contentContainer.appendChild(document.createElement('p'));
    dynamoObjectToChangeSubHeader.style = 'font-weight: bold;'
    dynamoObjectToChangeSubHeader.innerHTML = 'Dynamo Object to Change';

    // the description of the object to change
    let dynamoObjectToChangeTitleDiv = document.createElement('div');
    dynamoObjectToChangeTitleDiv.innerHTML = notSetText;
    dynamoObjectToChangeTitleDiv.id = dynamoObjectToChangeDescriptionID;
    contentContainer.appendChild(dynamoObjectToChangeTitleDiv);

    // the name of the object to change
    let dynamoObjectToChangeNameDiv = document.createElement('div');
    dynamoObjectToChangeNameDiv.innerHTML = '';
    dynamoObjectToChangeNameDiv.id = dynamoObjectToChangeGroupNameID;
    contentContainer.appendChild(dynamoObjectToChangeNameDiv);

    // the input count
    let dynamoObjectToChangeInputCountDiv = document.createElement('div');
    dynamoObjectToChangeInputCountDiv.innerHTML = '';
    dynamoObjectToChangeInputCountDiv.id = dynamoObjectToChangeInputCountID;
    contentContainer.appendChild(dynamoObjectToChangeInputCountDiv);

    // create the button to select the object to change
    contentContainer.appendChild(new FormIt.PluginUI.Button('Select Dynamo Object to Change', DynamoEyedropper.getDynamoInputsToChange).element);

    // create affected inputs subheader
    let reviewAndApplySubheader = contentContainer.appendChild(document.createElement('p'));
    reviewAndApplySubheader.style = 'font-weight: bold;'
    reviewAndApplySubheader.innerHTML = 'Review and Apply Changes';

    // when not all selections have been fulfilled
    let missingSelectionsDiv = contentContainer.appendChild(document.createElement('p'));
    missingSelectionsDiv.innerHTML = 'Select objects above to continue.';
    missingSelectionsDiv.id = missingSelectionsDivID;
    contentContainer.appendChild(missingSelectionsDiv);

    // when the selections are fulfilled, but incompatible
    let incompatibleSelectionsDiv = contentContainer.appendChild(document.createElement('p'));
    incompatibleSelectionsDiv.innerHTML = 'No common inputs found in the selected Dynamo objects.';
    incompatibleSelectionsDiv.id = incompatibleSelectionDivID;
    contentContainer.appendChild(incompatibleSelectionsDiv);

    // when the selections are fulfilled, compatible, but identical
    let identicalInputsDiv = contentContainer.appendChild(document.createElement('p'));
    identicalInputsDiv.innerHTML = 'All input values are either identical or incompatible.';
    identicalInputsDiv.id = identicalInputsDivID;
    contentContainer.appendChild(identicalInputsDiv);

    // create the affected inputs container
    // will be hidden until both selections are valid
    let reviewAndApplyDetailsDiv = contentContainer.appendChild(document.createElement('div'));
    reviewAndApplyDetailsDiv.id = reviewAndApplyDetailsDivID;

    // the list of inputs that will be affected, and how
    let affectedInputsCountDiv = document.createElement('div');
    affectedInputsCountDiv.innerHTML = affectedInputsPrefixText + dynamoInputNodesInCommon.length;
    affectedInputsCountDiv.id = affectedInputsCountID;
    reviewAndApplyDetailsDiv.appendChild(affectedInputsCountDiv);

    let affectedInputsListDiv = document.createElement('div');
    affectedInputsListDiv.id = affectedInputsListID;
    reviewAndApplyDetailsDiv.appendChild(affectedInputsListDiv)


    // create the button to apply the changes
    reviewAndApplyDetailsDiv.appendChild(new FormIt.PluginUI.Button('Apply Changes + Run', function()
    {
        var args = {
        "dynamoHistoryToModify" : dynamoHistoryIDToChange,
        "formattedGUIDsAndValuesObject": GUIDsAndValuesToModify
        }
    
        window.FormItInterface.CallMethod("DynamoEyedropper.setDynamoData", args);

    }).element);

    // update the review and apply section if necessary
    await DynamoEyedropper.updateUIForComparisonCheck();

    // create the footer
    document.body.appendChild(new FormIt.PluginUI.FooterModule().element);
}

/*** update mechanisms for the match object section ***/

DynamoEyedropper.updateUIForMatchObject = async function()
{
   DynamoEyedropper.tryGetDynamoObjectToMatch();
}

DynamoEyedropper.setMatchObjectToActiveState = async function()
{
    document.getElementById(dynamoObjectToMatchDescriptionID).innerHTML = objectIDPrefixText + dynamoHistoryIDToMatch;
    document.getElementById(dynamoObjectToMatchGroupNameID).innerHTML = groupNamePrefixText + dynamoGroupNameToMatch;
    document.getElementById(dynamoObjectToMatchInputCountID).innerHTML = inputCountPrefixText + dynamoInputNodesToMatch.length;

    bIsMatchObjectAvailable = true;

    if (bIsMatchObjectAvailable && bIsChangeObjectAvailable)
    {
        console.log("Both objects are present, starting comparison check...");

        await DynamoEyedropper.updateUIForComparisonCheck();
    }
    else
    {
        console.log("Missing one or more objects for comparison.");
    }
}

DynamoEyedropper.setMatchObjectToSelectingState = function()
{
    document.getElementById(dynamoObjectToMatchDescriptionID).innerHTML = objectIDSelectingText;
    document.getElementById(dynamoObjectToMatchGroupNameID).innerHTML = '';
    document.getElementById(dynamoObjectToMatchInputCountID).innerHTML = '';
}

DynamoEyedropper.setMatchObjectToUnsetState = function()
{
    document.getElementById(dynamoObjectToMatchDescriptionID).innerHTML = notSetText;
    document.getElementById(dynamoObjectToMatchGroupNameID).innerHTML = '';
    document.getElementById(dynamoObjectToMatchInputCountID).innerHTML = '';

    bIsMatchObjectAvailable = false;
}

/*** update mechanisms for the change object section ***/

DynamoEyedropper.updateUIForChangeObject = async function()
{
    DynamoEyedropper.tryGetDynamoObjectToChange();
}

DynamoEyedropper.setChangeObjectToActiveState = async function()
{
    document.getElementById(dynamoObjectToChangeDescriptionID).innerHTML = objectIDPrefixText + dynamoHistoryIDToChange;
    document.getElementById(dynamoObjectToChangeGroupNameID).innerHTML = groupNamePrefixText + dynamoGroupNameToChange;
    document.getElementById(dynamoObjectToChangeInputCountID).innerHTML = inputCountPrefixText + dynamoInputNodesToChange.length;

    bIsChangeObjectAvailable = true;

    if (bIsMatchObjectAvailable && bIsChangeObjectAvailable)
    {
        console.log("Both objects are present, starting comparison check...");

        await DynamoEyedropper.updateUIForComparisonCheck();
    }
    else
    {
        console.log("Missing one or more objects for comparison.");
    }
}

DynamoEyedropper.setChangeObjectToSelectingState = function()
{
    document.getElementById(dynamoObjectToChangeDescriptionID).innerHTML = objectIDSelectingText;
    document.getElementById(dynamoObjectToChangeGroupNameID).innerHTML = '';
    document.getElementById(dynamoObjectToChangeInputCountID).innerHTML = '';
}

DynamoEyedropper.setChangeObjectToUnsetState = function()
{
    document.getElementById(dynamoObjectToChangeDescriptionID).innerHTML = notSetText;
    document.getElementById(dynamoObjectToChangeGroupNameID).innerHTML = '';
    document.getElementById(dynamoObjectToChangeInputCountID).innerHTML = '';

    bIsChangeObjectAvailable = false;
}

/*** update mechanisms for the comparison section ***/

DynamoEyedropper.updateUIForComparisonCheck = async function()
{
    // if both the match object and change object are available
    if (bIsMatchObjectAvailable && bIsChangeObjectAvailable)
    {
        await DynamoEyedropper.getInputsInCommon();

        // no common input nodes found between these two objects
        if(dynamoInputNodesInCommon.length == 0)
        {
            document.getElementById(reviewAndApplyDetailsDivID).className = 'hide';
            document.getElementById(incompatibleSelectionDivID).className = 'body';
            document.getElementById(missingSelectionsDivID).className = 'hide';
            document.getElementById(identicalInputsDivID).className = 'hide';

            console.log("No matching inputs found for comparison.");
        }
        // common input nodes were found
        else
        {
            // common nodes were found, but their values are identical
            if (dynamoInputNamesToModify.length == 0)
            {
                document.getElementById(reviewAndApplyDetailsDivID).className = 'hide';
                document.getElementById(missingSelectionsDivID).className = 'hide';
                document.getElementById(incompatibleSelectionDivID).className = 'hide';
                document.getElementById(identicalInputsDivID).className = 'body';
            }
            // common node values are different, so we can show the review & apply section
            else
            {
                document.getElementById(reviewAndApplyDetailsDivID).className = 'body';
                document.getElementById(missingSelectionsDivID).className = 'hide';
                document.getElementById(incompatibleSelectionDivID).className = 'hide';
                document.getElementById(identicalInputsDivID).className = 'hide';
    
                // enable and update the list of nodes that will be changed, and how
                document.getElementById(affectedInputsCountID).innerHTML = affectedInputsPrefixText + dynamoInputNamesToModify.length;

                let affectedInputsListDiv = document.getElementById(affectedInputsListID);
                
                // clear the list of affected inputs first
                while (affectedInputsListDiv.hasChildNodes()) {
                    affectedInputsListDiv.removeChild(affectedInputsListDiv.lastChild);
                }

                // create a series of unordered lists to display
                for (let i = 0; i < dynamoInputNamesToModify.length; i++)
                {
                    let ul = document.createElement('ul');
                    ul.innerHTML = dynamoInputNamesToModify[i];
                    affectedInputsListDiv.appendChild(ul);
                    ul.style.padding = '0px 0px 0px 0px';
                    ul.style.fontStyle = 'italic';

                    let ul2 = document.createElement('ul');
                    ul.appendChild(ul2);

                    let valueComparisonLi = document.createElement('li');
                    valueComparisonLi.className = 'codeSnippet';
                    valueComparisonLi.style.fontStyle = 'normal';
                    valueComparisonLi.innerHTML = dynamoInputValuesToModifyBefore[i] + ' \u279e ' + dynamoInputValuesToModifyAfter[i];
                    ul2.appendChild(valueComparisonLi);

                }
                
                console.log("Number of inputs to modify: " + dynamoInputNamesToModify.length);
            }
        }
    }
    // missing one or both objects
    else
    {
        document.getElementById(missingSelectionsDivID).className = 'body';
        document.getElementById(incompatibleSelectionDivID).className = 'hide';
        document.getElementById(reviewAndApplyDetailsDivID).className = 'hide';
        document.getElementById(identicalInputsDivID).className = 'hide';
    }

}

/*** application code - runs asynchronously from plugin process to communicate with FormIt ***/

// this number is the invalid ID used to determine
// whether the selected object is a Dynamo history
DynamoEyedropper.invalidHistoryID = 4294967295;

// store the notification handles so they can be dismissed to prevent stacking notifications
DynamoEyedropper.selectionInProgressNotificationHandle = undefined;
DynamoEyedropper.selectionFailedNotificationHandle = undefined;

// dynamo data
let bIsMatchObjectAvailable;
let bIsChangeObjectAvailable;

let dynamoFileToMatch;
let dynamoHistoryIDToMatch;
let dynamoGroupNameToMatch;
let dynamoInputNodesToMatch;
let dynamoInputNodeGUIDsToMatch = new Array();
let dynamoInputNodeNamesToMatch = new Array();
let dynamoInputNodeValuesToMatch = new Array();

let dynamoFileToChange;
let dynamoHistoryIDToChange = DynamoEyedropper.invalidHistoryID;
let dynamoGroupNameToChange = DynamoEyedropper.invalidHistoryID;
let dynamoInputNodesToChange;
let dynamoInputNodeGUIDsToChange = new Array();
let dynamoInputNodeNamesToChange = new Array();
let dynamoInputNodeValuesToChange = new Array();

let dynamoInputNodesInCommon = new Array();

// only the nodes that have unique values to be changed
let dynamoInputGUIDsToModify = new Array();
let dynamoInputNamesToModify = new Array();
let dynamoInputValuesToModifyBefore = new Array();
let dynamoInputValuesToModifyAfter = new Array();

let GUIDsAndValuesToModify = {};

// try to get the match object
DynamoEyedropper.tryGetDynamoObjectToMatch = async function()
{
    // get the Dynamo history ID from the selection
    dynamoHistoryIDToMatch = await FormIt.Dynamo.GetSelectedDynamoHistory();
    dynamoGroupNameToMatch = await FormIt.Dynamo.GetDynamoGroupName(dynamoHistoryIDToMatch);
    dynamoInputNodesToMatch = await FormIt.Dynamo.GetInputNodes(dynamoHistoryIDToMatch, true);

    // selection was successful (result was not invalid)
    if (dynamoHistoryIDToMatch != DynamoEyedropper.invalidHistoryID)
    {
        await DynamoEyedropper.setMatchObjectToActiveState();

        await FormIt.Selection.ClearSelections();

        // clean up old notification handles, and show a new notification
        await FormIt.UI.CloseNotification(DynamoEyedropper.selectionInProgressNotificationHandle);    
        DynamoEyedropper.selectionInProgressNotificationHandle = undefined;
        await FormIt.UI.ShowNotification(DynamoEyedropper.selectionSuccessMessageText, FormIt.NotificationType.Success, 0);
        DynamoEyedropper.selectionFailedNotificationHandle = undefined;
    }
    // if the selection isn't valid, and if the in-progress notification handle hasn't been defined,
    // put the user back into selection mode
    else if (dynamoHistoryIDToMatch == DynamoEyedropper.invalidHistoryID && DynamoEyedropper.selectionInProgressNotificationHandle == undefined)
    {
        await FormIt.Selection.ClearSelections();

        bIsMatchObjectAvailable = false;
        bIsSelectionForMatchInProgress = true;

        DynamoEyedropper.setMatchObjectToSelectingState();
        await DynamoEyedropper.updateUIForComparisonCheck();

        // clean up old notification handles, and show a new notification
        await FormIt.UI.CloseNotification(DynamoEyedropper.selectionFailedNotificationHandle);
        DynamoEyedropper.selectionFailedNotificationHandle = undefined;
        DynamoEyedropper.selectionInProgressNotificationHandle = await FormIt.UI.ShowNotification(selectionMessagePrefixText + "to match...", FormIt.NotificationType.Information, 0);
    }
    // otherwise, this is the second time the user is trying to select
    // if it doesn't work at this point, consider the selection unset and end the selection session
    else if (dynamoHistoryIDToMatch == DynamoEyedropper.invalidHistoryID && DynamoEyedropper.selectionInProgressNotificationHandle)
    {
        await FormIt.Selection.ClearSelections();

        bIsMatchObjectAvailable = false;
        bIsSelectionForMatchInProgress = false;

        DynamoEyedropper.setMatchObjectToUnsetState();

        // clean up old notification handles, and show a new notification
        DynamoEyedropper.selectionFailedNotificationHandle = await FormIt.UI.ShowNotification(DynamoEyedropper.selectionFailureMessageText, FormIt.NotificationType.Error, 0);
        await FormIt.UI.CloseNotification(DynamoEyedropper.selectionInProgressNotificationHandle);
        DynamoEyedropper.selectionInProgressNotificationHandle = undefined;
    }
}

// try to get the change object
DynamoEyedropper.tryGetDynamoObjectToChange = async function()
{
    // get the Dynamo history ID from the selection
    dynamoHistoryIDToChange = await FormIt.Dynamo.GetSelectedDynamoHistory();
    dynamoGroupNameToChange = await FormIt.Dynamo.GetDynamoGroupName(dynamoHistoryIDToChange);
    dynamoInputNodesToChange = await FormIt.Dynamo.GetInputNodes(dynamoHistoryIDToChange, true);

    // selection was successful (result was not invalid)
    if (dynamoHistoryIDToChange != DynamoEyedropper.invalidHistoryID)
    {
        await DynamoEyedropper.setChangeObjectToActiveState();

        await FormIt.Selection.ClearSelections();

        // clean up old notification handles, and show a new notification
        await FormIt.UI.CloseNotification(DynamoEyedropper.selectionInProgressNotificationHandle);    
        DynamoEyedropper.selectionInProgressNotificationHandle = undefined;
        await FormIt.UI.ShowNotification(DynamoEyedropper.selectionSuccessMessageText, FormIt.NotificationType.Success, 0);
        DynamoEyedropper.selectionFailedNotificationHandle = undefined;
    }
    // if the selection isn't valid, and if the in-progress notification handle hasn't been defined,
    // put the user back into selection mode
    else if (dynamoHistoryIDToChange == DynamoEyedropper.invalidHistoryID && DynamoEyedropper.selectionInProgressNotificationHandle == undefined)
    {
        await FormIt.Selection.ClearSelections();

        bIsChangeObjectAvailable = false;
        bIsSelectionForChangeInProgress = true;

        DynamoEyedropper.setChangeObjectToSelectingState();
        await DynamoEyedropper.updateUIForComparisonCheck();

        // clean up old notification handles, and show a new notification
        await FormIt.UI.CloseNotification(DynamoEyedropper.selectionFailedNotificationHandle);
        DynamoEyedropper.selectionFailedNotificationHandle = undefined;
        DynamoEyedropper.selectionInProgressNotificationHandle = await FormIt.UI.ShowNotification(selectionMessagePrefixText + "to change...", FormIt.NotificationType.Information, 0);
    }
    // otherwise, this is the second time the user is trying to select
    // if it doesn't work at this point, consider the selection unset and end the selection session
    else if (dynamoHistoryIDToChange == DynamoEyedropper.invalidHistoryID && DynamoEyedropper.selectionInProgressNotificationHandle)
    {
        await FormIt.Selection.ClearSelections();

        bIsChangeObjectAvailable = false;
        bIsSelectionForChangeInProgress = false;

        DynamoEyedropper.setChangeObjectToUnsetState();

        // clean up old notification handles, and show a new notification
        DynamoEyedropper.selectionFailedNotificationHandle = await FormIt.UI.ShowNotification(DynamoEyedropper.selectionFailureMessageText, FormIt.NotificationType.Error, 0);
        await FormIt.UI.CloseNotification(DynamoEyedropper.selectionInProgressNotificationHandle);
        DynamoEyedropper.selectionInProgressNotificationHandle = undefined;
    }
}

// get all input nodes from the Dynamo object to match
DynamoEyedropper.getDynamoInputsToMatch = async function()
{
    console.clear();
    console.log("Dynamo Eyedropper");

    // get the selection basics
    await DynamoEyedropper.tryGetDynamoObjectToMatch();

    // first, get selection basics to know whether we should even proceed
    if (dynamoHistoryIDToMatch == DynamoEyedropper.invalidHistoryID)
    {
        return;
    }

    // if we get here, the selection is valid for the next steps
    dynamoInputNodesToMatch = await FormIt.Dynamo.GetInputNodes(dynamoHistoryIDToMatch, true);

    //console.log("Dynamo inputs: " + JSON.stringify(dynamoInputNodesToMatch));
}

// get all input nodes from the Dynamo object to match
DynamoEyedropper.getDynamoInputsToChange = async function()
{
    console.clear();
    console.log("Dynamo Eyedropper");

    // get the selection basics
    await DynamoEyedropper.tryGetDynamoObjectToChange();

    // first, get selection basics to know whether we should even proceed
    if (dynamoHistoryIDToChange == DynamoEyedropper.invalidHistoryID)
    {
        return;
    }

    // if we get here, the selection is valid for the next steps
    dynamoInputNodesToChange = await FormIt.Dynamo.GetInputNodes(dynamoHistoryIDToChange, true);

    //console.log("Dynamo inputs: " + JSON.stringify(dynamoInputNodesToChange));
}

// get the inputs that are in common between the two selected Dynamo objects
DynamoEyedropper.getInputsInCommon = async function()
{
    // clear the arrays
    dynamoInputNodesInCommon = [];

    dynamoInputNodeGUIDsToMatch = [];
    dynamoInputNodeNamesToMatch = [];
    dynamoInputNodeValuesToMatch = [];

    dynamoInputNodeGUIDsToChange = [];
    dynamoInputNodeNamesToChange = [];
    dynamoInputNodeValuesToChange = [];

    dynamoInputGUIDsToModify = [];
    dynamoInputNamesToModify = [];
    dynamoInputValuesToModifyBefore = [];
    dynamoInputValuesToModifyAfter = [];

    GUIDsAndValuesToModify = { };

    dynamoFileToMatch = await FormIt.Dynamo.GetDynamoFile(dynamoHistoryIDToMatch);
    //console.log("Dynamo file to match: " + JSON.stringify(dynamoFileToMatch));
    dynamoFileToChange = await FormIt.Dynamo.GetDynamoFile(dynamoHistoryIDToChange);
    //console.log("Dynamo file to change: " + JSON.stringify(dynamoFileToChange));

    // only proceed if both objects are present
    if (!(bIsMatchObjectAvailable && bIsChangeObjectAvailable))
    {
        return;
    }

    // for each input node in the list to match,
    // look for the same element by name in the list of input nodes to change
    dynamoInputNodesToMatch.forEach(inputNodeToMatch => {

        dynamoInputNodesToChange.forEach(inputNodeToChange => {

            let inputNodeNameToMatch = inputNodeToMatch[1];
            let inputNodeNameToChange = inputNodeToChange[1];
    
            // only record data if the names match
            if (inputNodeNameToMatch == inputNodeNameToChange)
            {
                // nodes
                dynamoInputNodesInCommon.push(inputNodeToChange);
    
                // GUIDs
                dynamoInputNodeGUIDsToMatch.push(inputNodeToMatch[0]);
                dynamoInputNodeGUIDsToChange.push(inputNodeToChange[0]);
    
                // names
                dynamoInputNodeNamesToMatch.push(inputNodeToMatch[1]);
                dynamoInputNodeNamesToChange.push(inputNodeToChange[1]);
    
                // values
                dynamoInputNodeValuesToMatch.push(DynamoEyedropper.getNodeInputValue(dynamoFileToMatch, inputNodeToMatch[0]));
                dynamoInputNodeValuesToChange.push(DynamoEyedropper.getNodeInputValue(dynamoFileToChange, inputNodeToChange[0]));
            }

        });
    });

    // for each of the match values, determine if any are different from the change values
    for (let j = 0; j < dynamoInputNodeValuesToChange.length; j++)
    {
        // if the values are different, push data to various arrays
        // need to also check if the match and change values are both numbers or not
        if ((dynamoInputNodeValuesToMatch[j] != dynamoInputNodeValuesToChange[j]) && 
        (isNaN(dynamoInputNodeValuesToMatch[j]) == isNaN(dynamoInputNodeValuesToChange[j])))
        {
            dynamoInputGUIDsToModify.push(dynamoInputNodeGUIDsToChange[j]);
            dynamoInputNamesToModify.push(dynamoInputNodeNamesToChange[j]);
            dynamoInputValuesToModifyBefore.push(dynamoInputNodeValuesToChange[j]);
            dynamoInputValuesToModifyAfter.push(dynamoInputNodeValuesToMatch[j]);
        }
    }

    GUIDsAndValuesToModify = DynamoEyedropper.createNodesAndValuesObject(dynamoInputGUIDsToModify, dynamoInputValuesToModifyAfter);

    console.log("Before values: " + dynamoInputValuesToModifyBefore);
    console.log("After values: " + dynamoInputValuesToModifyAfter);
}

// get the input value from the node GUID in the given Dynamo file
// TODO: replace this with new FormIt.Dynamo.GetInputNode(nHistoryId, GUID) after v22 ships
// see FORMIT-11493
DynamoEyedropper.getNodeInputValue = function(dynFile, nodeGUID)
{    
    for (let i = 0; i < dynFile.Nodes.length; i++)
    {
        let node = dynFile.Nodes[i];
        if (node["Id"] == nodeGUID)
        {
            return node["InputValue"];
        }
    }
}

DynamoEyedropper.createNodesAndValuesObject = function(arrayOfGUIDs, arrayOfValues)
{
    var object = {};

    for (let i = 0; i < arrayOfGUIDs.length; i++)
    {
        let guid = arrayOfGUIDs[i];
        let value = arrayOfValues[i];

        object[guid] = value;
        //let newObject = { "arrayOfGUIDs": arrayOfGUIDs[i], "arrayOfValues" : arrayOfValues[i] };
    }

    return object;
}