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
// affected inputs section
const affectedInputsListID = 'affectedInputsList';

const selectionMessagePrefixText = 'Select a Dynamo object ';
const objectIDPrefixText = 'Dynamo history ID: ';
const groupNamePrefixText = 'Group name: ';
const inputCountPrefixText = 'Input count: ';
const objectIDSelectingText = 'Selecting...';
const notSetText = '(not set)';

DynamoEyedropper.initializeUI = function()
{
    // create an overall container for all objects that comprise the "content" of the plugin
    // everything except the footer
    let contentContainer = document.createElement('div');
    contentContainer.id = 'contentContainer';
    contentContainer.className = 'contentContainer'
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
    let affectedInputsSubHeader = contentContainer.appendChild(document.createElement('p'));
    affectedInputsSubHeader.style = 'font-weight: bold;'
    affectedInputsSubHeader.innerHTML = 'Affected Inputs';

    // the list of inputs that will be affected, and how
    let affectedInputsListDiv = document.createElement('div');
    affectedInputsListDiv.innerHTML = 'Affected inputs will go here'
    affectedInputsListDiv.id = dynamoObjectToChangeDescriptionID;
    contentContainer.appendChild(affectedInputsListDiv);

    // create the apply subheader
    let applySubheader = contentContainer.appendChild(document.createElement('p'));
    applySubheader.style = 'font-weight: bold;'
    applySubheader.innerHTML = 'Apply Changes';

    // create the button to select the object to change
    contentContainer.appendChild(new FormIt.PluginUI.Button('Apply Changes', DynamoEyedropper.getDynamoInputsToChange).element);

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
        DynamoEyedropper.setMatchObjectToUnsetState();
    }
    else
    {
        DynamoEyedropper.setMatchObjectToActiveState();
    }
}

DynamoEyedropper.setMatchObjectToActiveState = function()
{
    document.getElementById(dynamoObjectToMatchDescriptionID).innerHTML = objectIDPrefixText + dynamoHistoryIDToMatch;
    document.getElementById(dynamoObjectToMatchGroupNameID).innerHTML = groupNamePrefixText + dynamoGroupNameToMatch;
    document.getElementById(dynamoObjectToMatchInputCountID).innerHTML = inputCountPrefixText + dynamoInputNodesToMatch.length;
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
        DynamoEyedropper.setChangeObjectToUnsetState();
    }
    else
    {
        DynamoEyedropper.setChangeObjectToActiveState();
    }
}

DynamoEyedropper.setChangeObjectToActiveState = function()
{
    document.getElementById(dynamoObjectToChangeDescriptionID).innerHTML = objectIDPrefixText + dynamoHistoryIDToChange;
    document.getElementById(dynamoObjectToChangeGroupNameID).innerHTML = groupNamePrefixText + dynamoGroupNameToChange;
    document.getElementById(dynamoObjectToChangeInputCountID).innerHTML = inputCountPrefixText + dynamoInputNodesToChange.length;
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
}

/*** application code - runs asynchronously from plugin process to communicate with FormIt ***/

// dynamo data
let dynamoHistoryIDToMatch;
let dynamoGroupNameToMatch;
let dynamoInputNodesToMatch;

let dynamoHistoryIDToChange;
let dynamoGroupNameToChange;
let dynamoInputNodesToChange;

// get the current history, query the selection, and report the number of items successfully selected
DynamoEyedropper.tryGetDynamoObjectToMatch = async function()
{
    // get the Dynamo history ID from the selection
    dynamoHistoryIDToMatch = await FormIt.Dynamo.GetSelectedDynamoHistory();
    dynamoInputNodesToMatch = await FormIt.Dynamo.GetInputNodes(dynamoHistoryIDToMatch, true);

    // if the selection didn't return a valid object, put the user in a select mode
    if (dynamoHistoryIDToMatch == 4294967295)
    {
        await FormIt.Selection.ClearSelections();

        let message = selectionMessagePrefixText + "to match";
        await FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
        console.log("\n" + message);

        DynamoEyedropper.setMatchObjectToSelectingState();

        bIsSelectionForMatchInProgress = true;
    }
    else
    {
        DynamoEyedropper.setMatchObjectToActiveState();
    }
}

// get the current history, query the selection, and report the number of items successfully selected
DynamoEyedropper.tryGetDynamoObjectToChange = async function()
{
    // get the Dynamo history ID from the selection
    dynamoHistoryIDToChange = await FormIt.Dynamo.GetSelectedDynamoHistory();
    dynamoINputNodesToMatch = await FormIt.Dynamo.GetInputNodes(dynamoHistoryIDToChange, true);

    // if the selection didn't return a valid object, put the user in a select mode
    if (dynamoHistoryIDToChange == 4294967295)
    {
        await FormIt.Selection.ClearSelections();

        let message = selectionMessagePrefixText + "to change";
        await FormIt.UI.ShowNotification(message, FormIt.NotificationType.Information, 0);
        console.log("\n" + message);

        DynamoEyedropper.setChangeObjectToSelectingState();

        bIsSelectionForChangeInProgress = true;
    }
    else
    {
        DynamoEyedropper.setChangeObjectToActiveState();
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

    console.log("Dynamo inputs: " + JSON.stringify(dynamoInputNodesToMatch));
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

    console.log("Dynamo inputs: " + JSON.stringify(dynamoInputNodesToChange));
}