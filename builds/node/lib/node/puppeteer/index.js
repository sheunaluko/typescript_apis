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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.puppeteer = exports.new_page = exports.get_browser = void 0;
const common = __importStar(require("../../common/index"));
const node = __importStar(require("../../node/index"));
var { io } = node;
var { R } = common;
const puppeteer_1 = __importDefault(require("puppeteer"));
exports.puppeteer = puppeteer_1.default;
const log = common.logger.get_logger({ id: "puppeteer" });
var started = false;
var browser = null;
function get_browser(ops) {
    return __awaiter(this, void 0, void 0, function* () {
        if (browser) {
            return browser;
        }
        else {
            log("Starting puppeteer...");
            browser = yield puppeteer_1.default.launch(Object.assign({
                headless: false,
                defaultViewport: null,
                slowMo: 5
            }, ops));
            log("Created browser");
            return browser;
        }
    });
}
exports.get_browser = get_browser;
function new_page(ops) {
    return __awaiter(this, void 0, void 0, function* () {
        let browser = yield get_browser(ops);
        let page = yield browser.newPage();
        return page;
    });
}
exports.new_page = new_page;
