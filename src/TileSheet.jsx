import React from "react";
import { connect } from "react-redux";
import * as R from "ramda";

import tileDefs from "./data/tiles";
import { groupsOf } from "./util";
import Tile from "./Tile";
import Svg from "./Svg";
import PageSetup from "./PageSetup";

import games from "./data/games";
import ColorContext from "./context/ColorContext";

import is from "ramda/src/is";
import propOr from "ramda/src/propOr";

const HEX_RATIO = 0.57735;
const RATIO = 1.0;

const tileColors = ["yellow", "green", "brown", "gray"];

const TileSheet = ({ match, paper, layout, hexWidth }) => {
  let game = games[match.params.game];
  let height = hexWidth;
  let width = height * HEX_RATIO * 2;
  let tileHeight = height * RATIO;
  let tileWidth = width * RATIO;
  let perRow = Math.floor(paper.width / (tileWidth + 12.5));
  let ids = R.sortWith(
    [
      R.ascend(id => tileColors.indexOf((tileDefs[id] || tileDefs[id.split("|")[0]] || {color:"other"}).color)),
      R.ascend(id => Number(id.split("|")[0] || 0)),
      R.ascend(id => Number(id.split("|")[1] || 0))
    ],
    R.chain(k => Array((is(Object, game.tiles[k]) ?
                       propOr(1, 'quantity', game.tiles[k]) :
                       game.tiles[k])).fill(k),
            R.keys(game.tiles))
  );

  let margin = layout === "individual" ? 12.5 : 0;
  let tiles = R.addIndex(R.map)(
    (row, i) => (
      <div
        key={i}
        className="row"
        style={{ width: `${(perRow * (tileWidth + margin) - margin) * 0.01}in` }}
      >
        {R.addIndex(R.map)(
          (id, i) => (
            <Svg
              key={`${id}-${i}`}
              style={{
                width: `${tileWidth * 0.01}in`,
                height: `${tileHeight * 0.01}in`
              }}
              viewBox={`-86.6025 -75 173.205 150`}
            >
              <Tile id={id} />
            </Svg>
          ),
          row
        )}
      </div>
    ),
    groupsOf(perRow, ids)
  );

  let offsetCss = `.tileSheet--offset div.row:nth-child(even) { padding-left: ${tileWidth * 0.005}in; }`;
  offsetCss +=    `.tileSheet--offset div.row:nth-child(odd) { padding-right: ${tileWidth * 0.005}in; }`;

  return (
    <ColorContext.Provider value="tile">
      <div className="PrintNotes">
        <div>
          <p>
            Tiles are meant to be printed in <b>portait</b> mode
          </p>
        </div>
      </div>
      <style>{offsetCss}</style>
      <div className={`tileSheet tileSheet--${layout}`}>
        {tiles}
        <PageSetup landscape={false}/>
      </div>
    </ColorContext.Provider>
  );
};

const mapStateToProps = state => ({
  layout: state.config.tiles.layout,
  paper: state.config.paper,
  hexWidth: state.config.tiles.width
});

export default connect(mapStateToProps)(TileSheet);
