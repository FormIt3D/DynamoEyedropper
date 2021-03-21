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
const objectIDPrefixText = 'Dynamo history ID: ';
const groupNamePrefixText = 'Group name: ';
const inputCountPrefixText = 'Input count: ';
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
    identicalInputsDiv.innerHTML = 'All input values are identical.';
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

    /*
    let affectedInputsListDiv = document.createElement('div');
    affectedInputsListDiv.innerHTML = affectedInputsListPrefixText + JSON.stringify(dynamoInputNodesInCommon);
    affectedInputsListDiv.id = affectedInputsListID;
    reviewAndApplyDetailsDiv.appendChild(affectedInputsListDiv);
    */

    let affectedInputsListDiv = document.createElement('div');
    affectedInputsListDiv.id = affectedInputsListID;
    reviewAndApplyDetailsDiv.appendChild(affectedInputsListDiv)


    // create the button to apply the changes
    reviewAndApplyDetailsDiv.appendChild(new FormIt.PluginUI.Button('Apply Changes', function()
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
    // try to get the selected history
    dynamoHistoryIDToMatch = await FormIt.Dynamo.GetSelectedDynamoHistory();
    dynamoGroupNameToMatch = await FormIt.Dynamo.GetDynamoGroupName(dynamoHistoryIDToMatch);
    dynamoInputNodesToMatch = await FormIt.Dynamo.GetInputNodes(dynamoHistoryIDToMatch, true);

    if (dynamoHistoryIDToMatch == 4294967295)
    {
        await DynamoEyedropper.setMatchObjectToUnsetState();
    }
    else
    {
        await DynamoEyedropper.setMatchObjectToActiveState();
    }
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
    // try to get the selected history
    dynamoHistoryIDToChange = await FormIt.Dynamo.GetSelectedDynamoHistory();
    dynamoGroupNameToChange = await FormIt.Dynamo.GetDynamoGroupName(dynamoHistoryIDToChange);
    dynamoInputNodesToChange = await FormIt.Dynamo.GetInputNodes(dynamoHistoryIDToChange, true);

    if (dynamoHistoryIDToChange == 4294967295)
    {
        await DynamoEyedropper.setChangeObjectToUnsetState();
    }
    else
    {
        await DynamoEyedropper.setChangeObjectToActiveState();
    }
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
    
                document.getElementById(affectedInputsCountID).innerHTML = affectedInputsPrefixText + dynamoInputNamesToModify.length;

                // clear the list of affected inputs first
                let affectedInputsListDiv = document.getElementById(affectedInputsListID);

                while (affectedInputsListDiv.hasChildNodes()) {
                    affectedInputsListDiv.removeChild(affectedInputsListDiv.lastChild);
                }

                // create a series of unordered lists to display
                for (let i = 0; i < dynamoInputNamesToModify.length; i++)
                {
                    let ul = document.createElement('ul');
                    ul.innerHTML = dynamoInputNamesToModify[i];
                    affectedInputsListDiv.appendChild(ul);

                    let ul2 = document.createElement('ul');
                    ul.appendChild(ul2);

                    let liBefore = document.createElement('li');
                    liBefore.innerHTML = 'Before: ' + dynamoInputValuesToModifyBefore[i];
                    ul2.appendChild(liBefore);

                    let liAfter = document.createElement('li');
                    liAfter.innerHTML = 'After: ' + dynamoInputValuesToModifyAfter[i];
                    ul2.appendChild(liAfter);

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
let dynamoHistoryIDToChange;
let dynamoGroupNameToChange;
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

// get the current history, query the selection, and report the number of items successfully selected
DynamoEyedropper.tryGetDynamoObjectToMatch = async function()
{
    // get the Dynamo history ID from the selection
    dynamoHistoryIDToMatch = await FormIt.Dynamo.GetSelectedDynamoHistory();
    dynamoGroupNameToMatch = await FormIt.Dynamo.GetDynamoGroupName(dynamoHistoryIDToMatch);
    dynamoInputNodesToMatch = await FormIt.Dynamo.GetInputNodes(dynamoHistoryIDToMatch, true);

    // if the selection didn't return a valid object, put the user in a select mode
    if (dynamoHistoryIDToMatch == 4294967295)
    {
        await FormIt.Selection.ClearSelections();

        let message = selectionMessagePrefixText + "to match";
        await FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
        console.log("\n" + message);

        bIsMatchObjectAvailable = false;
        bIsSelectionForMatchInProgress = true;

        DynamoEyedropper.setMatchObjectToSelectingState();
        await DynamoEyedropper.updateUIForComparisonCheck();

    }
    else
    {
        await DynamoEyedropper.setMatchObjectToActiveState();
    }
}

// get the current history, query the selection, and report the number of items successfully selected
DynamoEyedropper.tryGetDynamoObjectToChange = async function()
{
    // get the Dynamo history ID from the selection
    dynamoHistoryIDToChange = await FormIt.Dynamo.GetSelectedDynamoHistory();
    dynamoGroupNameToChange = await FormIt.Dynamo.GetDynamoGroupName(dynamoHistoryIDToChange);
    dynamoInputNodesToChange = await FormIt.Dynamo.GetInputNodes(dynamoHistoryIDToChange, true);

    // if the selection didn't return a valid object, put the user in a select mode
    if (dynamoHistoryIDToChange == 4294967295)
    {
        await FormIt.Selection.ClearSelections();

        let message = selectionMessagePrefixText + "to change";
        await FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
        console.log("\n" + message);

        bIsChangeObjectAvailable = false;
        bIsSelectionForChangeInProgress = true;

        DynamoEyedropper.setChangeObjectToSelectingState();
        await DynamoEyedropper.updateUIForComparisonCheck();

    }
    else
    {
        await DynamoEyedropper.setChangeObjectToActiveState();
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
    if (dynamoHistoryIDToMatch == null)
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
    if (dynamoHistoryIDToChange == null)
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
        if (dynamoInputNodeValuesToMatch[j] != dynamoInputNodeValuesToChange[j])
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

// get input values given an array of GUIDs, directly from the .json DYN
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