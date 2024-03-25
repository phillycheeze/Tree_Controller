import {ModuleRegistryExtend} from "cs2/modding";
import { bindValue, trigger, useValue } from "cs2/api";
import { tool } from "cs2/bindings";
import mod from "../../../mod.json";
import { VanillaComponentResolver } from "../VanillaComponentResolver/VanillaComponentResolver";
import { useLocalization } from "cs2/l10n";
import clearAgesSrc from "./AllYYTC.svg";
import brushSrc from "./BrushYYTC.svg";
import styles from "./treeController.module.scss";
import { useState } from "react";
import { Icon } from "cs2/ui";
import locale from "../lang/en-US.json";

export enum Ages 
{
    None = 0,
    Child = 1,
    Teen = 2,
    Adult = 4,
    Elderly = 8,
    Dead = 16,
    All = 32,
}

export enum ToolMode 
{
    Plop = 0,
    Brush = 1,
    ChangeAge = 2,
    ChangeType = 3,
}

export enum Selection
{
    Single = 0,
    BuildingOrNet = 1,
    Radius = 2,
    Map = 3,
}

// These contain the coui paths to Unified Icon Library svg assets
export const couiStandard =                         "coui://uil/Standard/";
export const ageChangSrc =          couiStandard +  "ReplaceTreeAge.svg";
export const prefabChangeSrc =      couiStandard +  "Replace.svg";
export const buildingOrNetSrc =     couiStandard +  "HouseandNetwork.svg";
export const radiusSrc =            couiStandard +  "Circle.svg";
export const wholeMapSrc    =       couiStandard +  "MapGrid.svg";
export const childSrc =             couiStandard +  "TreeSapling.svg";
export const teenSrc =              couiStandard +  "TreeTeen.svg";
export const adultSrc =             couiStandard +  "TreeAdult.svg";
export const elderlySrc =           couiStandard +  "TreeElderly.svg";
export const deadSrc =              couiStandard +  "TreeDead.svg";
export const arrowDownSrc =         couiStandard +  "ArrowDownThickStroke.svg";
export const arrowUpSrc =           couiStandard +  "ArrowUpThickStroke.svg";
export const deciduousSrc =         couiStandard +  "TreesDeciduous.svg";
export const evergreenSrc =         couiStandard +  "TreesNeedle.svg";
export const bushesSrc =            couiStandard +  "Bushes.svg";
export const diskSaveSrc =          couiStandard +  "DiskSave.svg";
export const randomRotationSrc =    couiStandard +  "Dice.svg";

// These establishes the binding with C# side. Without C# side game ui will crash.
export const ToolMode$ =            bindValue<number> (mod.id, 'ToolMode');
export const SelectedAges$ =        bindValue<number> (mod.id, 'SelectedAges');
export const SelectionMode$ =       bindValue<number> (mod.id, 'SelectionMode');
export const IsVegetation$ =        bindValue<boolean>(mod.id, 'IsVegetation');
export const IsTree$ =              bindValue<boolean>(mod.id, 'IsTree');
export const Radius$ =              bindValue<number>(mod.id, 'Radius');
export const PrefabSet$ =           bindValue<string>(mod.id, 'PrefabSet');

// These are strings that will be used for event triggers.
export const radiusDownID =             "radius-down-arrow";
export const radiusUpID =               "radius-up-arrow";
export const deciduousTreesID =         "YYTC-wild-deciduous-trees";
export const evergreenTreesID =         "YYTC-evergreen-trees";
export const wildBushesID =             "YYTC-wild-bushes";
export const customSetID =              "YYTC-custom-set-";

// This functions trigger an event on C# side and C# designates the method to implement.
export function handleClick(eventName: string) 
{
    trigger(mod.id, eventName);
}

// This function triggers an event to change the tree controller tool mode to specified tool mode.
export function changeToolMode(toolMode: ToolMode) {
    trigger(mod.id, "ChangeToolMode", toolMode);
}

// This function triggers an event to change the selected age.
export function changeSelectedAge(age: Ages) {
    trigger(mod.id, "ChangeSelectedAge", age);
}

// This function triggers an event to change the tree controller selection mode.
export function changeSelectionMode(selectionMode: Selection) {
    trigger(mod.id, "ChangeSelectionMode", selectionMode);
}

// This function triggers an event to change the prefab set.
export function changePrefabSet(prefabSet: string) {
    trigger(mod.id, "ChangePrefabSet", prefabSet);
}

// This is working, but it's possible a better solution is possible.
export function descriptionTooltip(tooltipTitle: string | null, tooltipDescription: string | null) : JSX.Element {
    return (
        <>
            <div className={VanillaComponentResolver.instance.descriptionTooltipTheme.title}>{tooltipTitle}</div>
            <div className={VanillaComponentResolver.instance.descriptionTooltipTheme.content}>{tooltipDescription}</div>
        </>
    );
}

export const TreeControllerComponent: ModuleRegistryExtend = (Component : any) => 
{
    // I believe you should not put anything here.
    return (props) => 
    {
        const {children, ...otherProps} = props || {};

        // These get the value of the bindings.
        const objectToolActive = useValue(tool.activeTool$).id == tool.OBJECT_TOOL;
        const treeControllerToolActive = useValue(tool.activeTool$).id == "Tree Controller Tool";
        const lineToolActive = useValue(tool.activeTool$).id == "Line Tool";
        const SelectionMode = useValue(SelectionMode$);
        const CurrentToolMode = useValue(ToolMode$);
        const SelectedAges = useValue(SelectedAges$) as Ages;
        const Radius = useValue(Radius$);
        const IsVegetation = useValue(IsVegetation$);
        const IsTree = useValue(IsTree$);
        const PrefabSet = useValue(PrefabSet$);

        // These set up state variables for custom sets switching from number to save disk icon.
        const [isCustomSet1Hovered, setCustomSet1Hovered] = useState(false);
        const [isCustomSet2Hovered, setCustomSet2Hovered] = useState(false);
        const [isCustomSet3Hovered, setCustomSet3Hovered] = useState(false);
        const [isCustomSet4Hovered, setCustomSet4Hovered] = useState(false);
        const [isCustomSet5Hovered, setCustomSet5Hovered] = useState(false);

        // These functions generate a div with either a number inside or an icon. might be amore efficient way to do this.
        function GenerateCustomSetNumber1() : JSX.Element 
        {
            return (
                <div className = {styles.yyNumberedButton} 
                     onMouseEnter={(ev) => {if (ev.ctrlKey) setCustomSet1Hovered(true); else setCustomSet1Hovered(false)}}
                     onMouseLeave={() => setCustomSet1Hovered(false)}>
                    {isCustomSet1Hovered ? <Icon src={diskSaveSrc}></Icon> : 1}
                </div>
            );
        }

        function GenerateCustomSetNumber2() : JSX.Element 
        {
            return (
                <div className = {styles.yyNumberedButton} 
                     onMouseEnter={(ev) => {if (ev.ctrlKey) setCustomSet2Hovered(true); else setCustomSet2Hovered(false)}}
                     onMouseLeave={() => setCustomSet2Hovered(false)}>
                    {isCustomSet2Hovered ? <Icon src={diskSaveSrc}></Icon> : 2}
                </div>
            );
        }

        function GenerateCustomSetNumber3() : JSX.Element 
        {
            return (
                <div className = {styles.yyNumberedButton} 
                     onMouseEnter={(ev) => {if (ev.ctrlKey) setCustomSet3Hovered(true); else setCustomSet3Hovered(false)}}
                     onMouseLeave={() => setCustomSet3Hovered(false)}>
                    {isCustomSet3Hovered ? <Icon src={diskSaveSrc}></Icon> : 3}
                </div>
            );
        }

        function GenerateCustomSetNumber4() : JSX.Element 
        {
            return (
                <div className = {styles.yyNumberedButton} 
                     onMouseEnter={(ev) => {if (ev.ctrlKey) setCustomSet4Hovered(true); else setCustomSet4Hovered(false)}}
                     onMouseLeave={() => setCustomSet4Hovered(false)}>
                    {isCustomSet4Hovered ? <Icon src={diskSaveSrc}></Icon> : 4}
                </div>
            );
        }

        function GenerateCustomSetNumber5() : JSX.Element 
        {
            return (
                <div className = {styles.yyNumberedButton} 
                     onMouseEnter={(ev) => {if (ev.ctrlKey) setCustomSet5Hovered(true); else setCustomSet5Hovered(false)}}
                     onMouseLeave={() => setCustomSet5Hovered(false)}>
                    {isCustomSet5Hovered ? <Icon src={diskSaveSrc}></Icon> : 5}
                </div>
            );
        }
        
        
        // translation handling. Translates using locale keys that are defined in C# or fallback string here.
        const { translate } = useLocalization();

        const createTooltipTitle = translate("ToolOptions.TOOLTIP_TITLE[Create]", "Place one");
        const createTooltipDescription = translate("ToolOptions.TOOLTIP_DESCRIPTION[Create]", "Place an individual item on the map.");
        const brushTooltipTitle = translate("ToolOptions.TOOLTIP_TITLE[Brush]", "Place multiple");
        const brushTooltipDescription = translate("ToolOptions.TOOLTIP_DESCRIPTION[Brush]", "Place several items at once. Brush size determines the area, and brush strength the density of items.");

        const deciduousTooltipTitle = translate("YY_TREE_CONTROLLER[wild-deciduous-trees]",locale["YY_TREE_CONTROLLER[wild-deciduous-trees]"]);
        const deciduousTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[wild-deciduous-trees]",locale["YY_TREE_CONTROLLER_DESCRIPTION[wild-deciduous-trees]"]);
        const evergreenTooltipTitle = translate("YY_TREE_CONTROLLER[evergreen-trees]" ,locale["YY_TREE_CONTROLLER[evergreen-trees]"]);
        const evergreenTooltipDescription = translate( "YY_TREE_CONTROLLER_DESCRIPTION[evergreen-trees]",locale["YY_TREE_CONTROLLER_DESCRIPTION[evergreen-trees]"]);
        const wildBushesTooltipTitle = translate("YY_TREE_CONTROLLER[wild-bushes]",locale["YY_TREE_CONTROLLER[wild-bushes]"]);
        const wildBushesTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[wild-bushes]",locale["YY_TREE_CONTROLLER_DESCRIPTION[wild-bushes]"]);
        const customSet1TooltipTitle = translate("YY_TREE_CONTROLLER[custom-set-1]",locale["YY_TREE_CONTROLLER[custom-set-1]"]);
        const customSet1TooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[custom-set-1]",locale["YY_TREE_CONTROLLER_DESCRIPTION[custom-set-1]"]);
        const customSet2TooltipTitle = translate("YY_TREE_CONTROLLER[custom-set-2]",locale["YY_TREE_CONTROLLER[custom-set-2]"]);
        const customSet2TooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[custom-set-2]",locale["YY_TREE_CONTROLLER_DESCRIPTION[custom-set-2]"]);
        const customSet3TooltipTitle = translate("YY_TREE_CONTROLLER[custom-set-3]",locale["YY_TREE_CONTROLLER[custom-set-3]"]);
        const customSet3TooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[custom-set-3]",locale["YY_TREE_CONTROLLER_DESCRIPTION[custom-set-3]"]);
        const customSet4TooltipTitle = translate("YY_TREE_CONTROLLER[custom-set-4]",locale["YY_TREE_CONTROLLER[custom-set-4]"]);
        const customSet4TooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[custom-set-4]",locale["YY_TREE_CONTROLLER_DESCRIPTION[custom-set-4]"]);
        const customSet5TooltipTitle = translate("YY_TREE_CONTROLLER[custom-set-5]",locale["YY_TREE_CONTROLLER[custom-set-5]"]);
        const customSet5TooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[custom-set-5]",locale["YY_TREE_CONTROLLER_DESCRIPTION[custom-set-5]"]);
        const clearAgeTooltipTitle = translate("YY_TREE_CONTROLLER[clear-ages]",locale["YY_TREE_CONTROLLER[clear-ages]"]);
        const clearAgeTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[clear-ages]", locale["YY_TREE_CONTROLLER_DESCRIPTION[clear-ages]"]);
        const childTooltipTitle = translate("YY_TREE_CONTROLLER[child]",locale["YY_TREE_CONTROLLER[child]"]);
        const childTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[child]",locale["YY_TREE_CONTROLLER_DESCRIPTION[child]"]);
        const teenTooltipTitle = translate("YY_TREE_CONTROLLER[teen]",locale["YY_TREE_CONTROLLER[teen]"]);
        const teenTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[teen]",locale["YY_TREE_CONTROLLER_DESCRIPTION[teen]"]);
        const adultTooltipTitle = translate("YY_TREE_CONTROLLER[adult]",locale["YY_TREE_CONTROLLER[adult]"]);
        const adultTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[adult]",locale["YY_TREE_CONTROLLER_DESCRIPTION[adult]"]);
        const elderlyTooltipTitle = translate("YY_TREE_CONTROLLER[elderly]",locale["YY_TREE_CONTROLLER[elderly]"]);
        const elderlyTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[elderly]",locale["YY_TREE_CONTROLLER_DESCRIPTION[elderly]"]);
        const deadTooltipTitle = translate("YY_TREE_CONTROLLER[dead]",locale["YY_TREE_CONTROLLER[dead]"]);
        const deadTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[dead]",locale["YY_TREE_CONTROLLER_DESCRIPTION[dead]"]);
        const singleTreeTooltipTitle = translate("YY_TREE_CONTROLLER[single-tree]",locale["YY_TREE_CONTROLLER[single-tree]"]);
        const singleTreeTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[single-tree]",locale["YY_TREE_CONTROLLER_DESCRIPTION[single-tree]"]);
        const buildingOrNetTooltipTitle = translate("YY_TREE_CONTROLLER[building-or-net]",locale["YY_TREE_CONTROLLER[building-or-net]"]);
        const buildingOrNetTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[building-or-net]",locale["YY_TREE_CONTROLLER_DESCRIPTION[building-or-net]"]);
        const radiusTooltipTitle = translate("YY_TREE_CONTROLLER[radius]",locale["YY_TREE_CONTROLLER[radius]"]);
        const radiusTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[radius]", locale["YY_TREE_CONTROLLER_DESCRIPTION[radius]"]);
        const wholeMapTooltipTitle = translate("YY_TREE_CONTROLLER[whole-map]",locale["YY_TREE_CONTROLLER[whole-map]"]);
        const wholeMapTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[whole-map]",locale["YY_TREE_CONTROLLER_DESCRIPTION[whole-map]"]);
        const radiusUpTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[radius-up-arrow]",locale["YY_TREE_CONTROLLER_DESCRIPTION[radius-up-arrow]"]);
        const radiusDownTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[radius-up-arrow]",locale["YY_TREE_CONTROLLER_DESCRIPTION[radius-up-arrow]"]);
        const changeAgeTooltipTitle = translate("YY_TREE_CONTROLLER[change-age-tool]",locale["YY_TREE_CONTROLLER[change-age-tool]"]);
        const changeAgeTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[change-age-tool]",locale["YY_TREE_CONTROLLER_DESCRIPTION[change-age-tool]"]);
        const changePrefabTooltipTitle = translate("YY_TREE_CONTROLLER[change-prefab-tool]",locale["YY_TREE_CONTROLLER[change-prefab-tool]"]);
        const changePrefabTooltipDescription = translate("YY_TREE_CONTROLLER_DESCRIPTION[change-prefab-tool]",locale["YY_TREE_CONTROLLER_DESCRIPTION[change-prefab-tool]"]);

        var result = Component();
        
        if (((objectToolActive || treeControllerToolActive || lineToolActive) && IsVegetation) || (treeControllerToolActive && CurrentToolMode == ToolMode.ChangeAge) ) 
        {
            result.props.children?.push
            (
                /* 
                Conditionally adds new sections after other tool options sections with translated title based of localization key from binding. Localization key defined in C#.
                All buttons have translated tooltips, some have titles. OnSelect triggers C# events. Src paths are local imports.
                Radius section has up, and down buttons and text field.
                */
                <>
                    { ((objectToolActive && CurrentToolMode == ToolMode.Brush) || (treeControllerToolActive && CurrentToolMode == ToolMode.ChangeType) || lineToolActive) && (
                    <VanillaComponentResolver.instance.Section title={translate("YY_TREE_CONTROLLER[Sets]",locale["YY_TREE_CONTROLLER[Sets]"])}>
                        <VanillaComponentResolver.instance.ToolButton  selected={PrefabSet == deciduousTreesID}     tooltip={descriptionTooltip(deciduousTooltipTitle,deciduousTooltipDescription)}         onSelect={() => changePrefabSet(deciduousTreesID)}    src={deciduousSrc}                                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={PrefabSet == evergreenTreesID}     tooltip={descriptionTooltip(evergreenTooltipTitle, evergreenTooltipDescription)}        onSelect={() => changePrefabSet(evergreenTreesID)}    src={evergreenSrc}                                                focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={PrefabSet == wildBushesID}         tooltip={descriptionTooltip(wildBushesTooltipTitle, wildBushesTooltipDescription)}      onSelect={() => changePrefabSet(wildBushesID)}        src={bushesSrc}                                                   focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={PrefabSet == customSetID+1}        tooltip={descriptionTooltip(customSet1TooltipTitle, customSet1TooltipDescription)}      onSelect={() => changePrefabSet(customSetID+1)}                             children={GenerateCustomSetNumber1()}       focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={PrefabSet == customSetID+2}        tooltip={descriptionTooltip(customSet2TooltipTitle, customSet2TooltipDescription)}      onSelect={() => changePrefabSet(customSetID+2)}                             children={GenerateCustomSetNumber2()}       focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={PrefabSet == customSetID+3}        tooltip={descriptionTooltip(customSet3TooltipTitle, customSet3TooltipDescription)}      onSelect={() => changePrefabSet(customSetID+3)}                             children={GenerateCustomSetNumber3()}       focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={PrefabSet == customSetID+4}        tooltip={descriptionTooltip(customSet4TooltipTitle, customSet4TooltipDescription)}      onSelect={() => changePrefabSet(customSetID+4)}                             children={GenerateCustomSetNumber4()}       focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={PrefabSet == customSetID+5}        tooltip={descriptionTooltip(customSet5TooltipTitle, customSet5TooltipDescription)}      onSelect={() => changePrefabSet(customSetID+5)}                             children={GenerateCustomSetNumber5()}       focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                    </VanillaComponentResolver.instance.Section>
                    )}
                    { (IsTree || (treeControllerToolActive && CurrentToolMode == ToolMode.ChangeAge)) && (
                    <VanillaComponentResolver.instance.Section title={translate("YY_TREE_CONTROLLER[Age]",locale["YY_TREE_CONTROLLER[Age]"])}>
                        <VanillaComponentResolver.instance.ToolButton  selected={(SelectedAges & Ages.All) == Ages.All}         tooltip={descriptionTooltip(clearAgeTooltipTitle, clearAgeTooltipDescription)}      onSelect={() => changeSelectedAge(Ages.All)}        src={clearAgesSrc}       focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={(SelectedAges & Ages.Child) == Ages.Child}     tooltip={descriptionTooltip(childTooltipTitle, childTooltipDescription)}            onSelect={() => changeSelectedAge(Ages.Child)}      src={childSrc}           focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={(SelectedAges & Ages.Teen) == Ages.Teen}       tooltip={descriptionTooltip(teenTooltipTitle, teenTooltipDescription)}              onSelect={() => changeSelectedAge(Ages.Teen)}       src={teenSrc}            focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={(SelectedAges & Ages.Adult) == Ages.Adult}     tooltip={descriptionTooltip(adultTooltipTitle, adultTooltipDescription)}            onSelect={() => changeSelectedAge(Ages.Adult)}      src={adultSrc}           focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={(SelectedAges & Ages.Elderly) == Ages.Elderly} tooltip={descriptionTooltip(elderlyTooltipTitle, elderlyTooltipDescription)}        onSelect={() => changeSelectedAge(Ages.Elderly)}    src={elderlySrc}         focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={(SelectedAges & Ages.Dead) == Ages.Dead}       tooltip={descriptionTooltip(deadTooltipTitle, deadTooltipDescription)}              onSelect={() => changeSelectedAge(Ages.Dead)}       src={deadSrc}            focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                    </VanillaComponentResolver.instance.Section>
                    )}
                    { treeControllerToolActive && (
                    <VanillaComponentResolver.instance.Section title={translate("YY_TREE_CONTROLLER[Selection]",locale["YY_TREE_CONTROLLER[Selection]"])}>
                        <VanillaComponentResolver.instance.ToolButton  selected={SelectionMode == Selection.Single}         tooltip={descriptionTooltip(singleTreeTooltipTitle, singleTreeTooltipDescription)}          onSelect={() => changeSelectionMode(Selection.Single)}             src={adultSrc}            focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={SelectionMode == Selection.BuildingOrNet}  tooltip={descriptionTooltip(buildingOrNetTooltipTitle, buildingOrNetTooltipDescription)}    onSelect={() => changeSelectionMode(Selection.BuildingOrNet)}      src={buildingOrNetSrc}    focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={SelectionMode == Selection.Radius}         tooltip={descriptionTooltip(radiusTooltipTitle, radiusTooltipDescription)}                  onSelect={() => changeSelectionMode(Selection.Radius)}             src={radiusSrc}           focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                        <VanillaComponentResolver.instance.ToolButton  selected={SelectionMode == Selection.Map}            tooltip={descriptionTooltip(wholeMapTooltipTitle, wholeMapTooltipDescription)}              onSelect={() => changeSelectionMode(Selection.Map)}                src={wholeMapSrc}         focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                    </VanillaComponentResolver.instance.Section>
                    )}
                    { treeControllerToolActive && SelectionMode == Selection.Radius && (
                    <VanillaComponentResolver.instance.Section title={translate("YY_TREE_CONTROLLER[Radius]",locale["YY_TREE_CONTROLLER[Radius]"])}>
                        <VanillaComponentResolver.instance.ToolButton tooltip={radiusDownTooltipDescription} onSelect={() => handleClick(radiusDownID)} src={arrowDownSrc} focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED} className={VanillaComponentResolver.instance.mouseToolOptionsTheme.startButton}></VanillaComponentResolver.instance.ToolButton>
                        <div className={VanillaComponentResolver.instance.mouseToolOptionsTheme.numberField}>{ Radius + " m"}</div>
                        <VanillaComponentResolver.instance.ToolButton tooltip={radiusUpTooltipDescription} onSelect={() => handleClick(radiusUpID)} src={arrowUpSrc} focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED} className={VanillaComponentResolver.instance.mouseToolOptionsTheme.endButton} ></VanillaComponentResolver.instance.ToolButton>
                    </VanillaComponentResolver.instance.Section>
                    )}
                    { (treeControllerToolActive || objectToolActive) && (
                    <VanillaComponentResolver.instance.Section title={translate("YY_TREE_CONTROLLER[change]",locale["YY_TREE_CONTROLLER[change]"])}>
                            <VanillaComponentResolver.instance.ToolButton  selected={CurrentToolMode == ToolMode.ChangeAge}     tooltip={descriptionTooltip(changeAgeTooltipTitle, changeAgeTooltipDescription)}        onSelect={() => changeToolMode(ToolMode.ChangeAge)}     src={ageChangSrc}      focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                            <VanillaComponentResolver.instance.ToolButton  selected={CurrentToolMode == ToolMode.ChangeType}    tooltip={descriptionTooltip(changePrefabTooltipTitle, changePrefabTooltipDescription)}  onSelect={() => changeToolMode(ToolMode.ChangeType)}    src={prefabChangeSrc}  focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                    </VanillaComponentResolver.instance.Section>
                    )}
                    { treeControllerToolActive && (
                    <VanillaComponentResolver.instance.Section title={translate("Toolbar.TOOL_MODE_TITLE", "Tool Mode")}>
                            <VanillaComponentResolver.instance.ToolButton  selected={CurrentToolMode == ToolMode.Plop}    tooltip={descriptionTooltip(createTooltipTitle, createTooltipDescription)}        onSelect={() => changeToolMode(ToolMode.Plop)}     src={adultSrc}      focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                            <VanillaComponentResolver.instance.ToolButton  selected={CurrentToolMode == ToolMode.Brush}    tooltip={descriptionTooltip(brushTooltipTitle, brushTooltipDescription)}         onSelect={() => changeToolMode(ToolMode.Brush)}    src={brushSrc}      focusKey={VanillaComponentResolver.instance.FOCUS_DISABLED}     className={VanillaComponentResolver.instance.toolButtonTheme.button}></VanillaComponentResolver.instance.ToolButton>
                    </VanillaComponentResolver.instance.Section>                
                    )}
                </>
            );
        }
        return result;
    };
}