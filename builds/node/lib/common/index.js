"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.module_manager = exports.web3 = exports.trading = exports.R = exports.logger = exports.fp = void 0;
const fp = __importStar(require("./fp"));
exports.fp = fp;
const logger = __importStar(require("./logger"));
exports.logger = logger;
const R = __importStar(require("ramda"));
exports.R = R;
const trading = __importStar(require("./trading/index"));
exports.trading = trading;
const web3 = __importStar(require("./web3/index"));
exports.web3 = web3;
const module_manager = __importStar(require("./module_manager"));
exports.module_manager = module_manager;
