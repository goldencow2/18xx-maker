import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import { unitsToCss, unitsToCssMm } from "./util";
import { setConfig } from "./store/actions";

import defaultConfig from "./config.json";
import schema from "./data/schemas/config.schema.json";

import assocPath from "ramda/src/assocPath";
import chain from "ramda/src/chain";
import compose from "ramda/src/compose";
import complement from "ramda/src/complement";
import filter from "ramda/src/filter";
import isEmpty from "ramda/src/isEmpty";
import map from "ramda/src/map";
import path from "ramda/src/path";
import split from "ramda/src/split";

import "./Config.scss";

export const getPath = split('.');
export const getSchemaPath = compose(chain(n => ['properties', n]),
                                     filter(complement(isEmpty)),
                                     split('.'));
export const getSchema = name => path(getSchemaPath(name), schema);

const inputState = (state , {name}) => ({
  config: state.config,
  value: path(split('.', name), state.config)
});
const inputDispatch = dispatch => ({
  setConfig: config => dispatch(setConfig(config))
});

const _Input = ({name, label, description, config, value, setConfig, dimension}) => {
  let valuePath = getPath(name);
  let update = event => setConfig(assocPath(valuePath,
                                           event.target.type === "checkbox" ?
                                           event.target.checked :
                                           event.target.value,
                                           config));

  let inputSchema = getSchema(name);
  let inputNode = null;

  let [tempValue, setTempValue] = useState(value);
  useEffect(() => {
    setTempValue(value);
  }, [value]); // Only re-run the effect if count changes

  if (inputSchema && inputSchema.type === "string") {
    if (inputSchema.enum) {
      inputNode = (
        <>
          <label htmlFor={name}>{label}: </label>
          <select id={name} name={name}
                  value={value}
                  onChange={update}>
            {map(opt => <option key={opt} value={opt}>{opt}</option>,
                 inputSchema.enum)}
          </select>
        </>
      );
    } else {
      inputNode = (
        <>
          <label htmlFor={name}>{label}: </label>
          <input style={{width:"4in"}} type="text"
                 id={name} name={name}
                 value={tempValue}
                 onChange={event => setTempValue(event.target.value)}
                 onBlur={update}/>
        </>
      );
    }
  } else if (inputSchema && inputSchema.type === "boolean") {
    inputNode = (
      <label><input id={name} name={name} type="checkbox" checked={value} onChange={update}/> {label}</label>
    );
  } else {
    inputNode = (
      <>
        <label htmlFor={name}>{label}: </label>
        <input style={{width:"0.5in"}} type="number"
               id={name} name={name}
               value={value}
               onChange={update}/>
        {dimension && <span> {unitsToCss(value)} / {unitsToCssMm(value)}</span>}
      </>
    );
  }

  return (
    <div id={`config-${name}`} className="input">
      <p>{description}</p>
      {inputNode}
    </div>
  );
};
const Input = connect(inputState, inputDispatch)(_Input);

const Config = ({config, setConfig, resetConfig}) => {
  let setOption = event => setConfig({ ...config, [event.target.name]: event.target.value });

  return (
    <div className="config">
      <h2>Config</h2>
      <p>Here you can set any options for how to lay out and render these 18xx games.</p>
      <h3>Theme</h3>
      <p>The theme determines which colors are used for all of the elements on the maps and tiles.</p>
      <select name="scheme" value={config.scheme} onChange={setOption}>
        <option value="gmt">GMT</option>
        <option value="dtg">Deep Thought</option>
        <option value="aag">All Aboard Games</option>
        <option value="ps18xx">px18xx</option>
        <option value="carth">Carth</option>
      </select>
      <h3>Layout</h3>
      <Input name="pagination" label="Pagination Type"
             description="This lets you configure the type of pagination. Equal keeps all pages directly equal. Max keeps the first and last page equal and set all middle pages to max based on page size."/>
      <Input name="paper.width" label="Paper Width" dimension={true}
             description="Print paper width in 100th's of an inch."/>
      <Input name="paper.height" label="Paper Height" dimension={true}
             description="Print paper height in 100th's of an inch."/>
      <Input name="paper.margins" label="Paper Margins" dimension={true}
             description="Print paper margin in 100th's of an inch."/>
      <h3>Maps</h3>
      <Input name="plainMapHomes" label="Plain Map Home Spaces"
             description="This sets all home spots on maps to be empty white cities with black company text instead of colored or using logos." />
      {/* This option isn't working yet, will add later */}
      {/* <Checkbox name="plainMapDestinations" label="Plain Map Destination Spaces" */}
      {/*           description="This sets all destination spots on maps to be empty white cities with black company text:" /> */}
      {/* This option isn't working yet, will add later */}
      {/* <Checkbox name="useCompanySvgLogos" label="Use Company SVG Logos" */}
      {/*           description="This will attempt to use svg images for company logos on the map and tokens if the logo is avaialable:" /> */}
      <Input name="coords" label="Coordinate Type"
             description="This lets you choose where the coordinates appear on the map (if at all)."/>
      <h3>Tiles</h3>
      <Input name="tiles.layout" label="Tile Sheet Layout"
             description="This determines how to lay out the tiles on the tile sheet. Offset is the style that tries to make as few cuts as possible. Individual just has each tile separate from the others, and Die is meant from the custom Die cutters that Deep Thought Games uses"/>
      <Input name="tiles.width" label="Tile Width"
             description="This determines the default size of maps and tiles. It is an integer in 100th's of an inch that define the distance from flat to flat. 150 would be standard 18xx size. 100 is small (1822 / 18OE) size. GMT is supposed to be about 171 but I need to confirm."/>
      <h3>Stock Markets</h3>
      <h3>Cards</h3>
      <Input name="shareLayout" label="Share Layout"
             description="This lets you choose between two layouts for shares. One keeps the token in the center of the card, the other puts the tokens on the let (Simular to All Aboard Games and Deep Thought Games)."/>
      <h2>Reset</h2>
      <p>You can remove any custom settings and revert back to the defaults with this button.</p>
      <button onClick={resetConfig}>Reset To Defaults</button>
      <p>These values are saved on this browser in local storage.</p>
    </div>
  );
};

const mapStateToProps = state => ({
  config: state.config
});

const mapDispatchToProps = dispatch => ({
  setConfig: config => dispatch(setConfig(config)),
  resetConfig: () => dispatch(setConfig(defaultConfig))
});

export default connect(mapStateToProps, mapDispatchToProps)(Config);
