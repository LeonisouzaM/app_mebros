"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var db_1 = __importStar(require("./db"));
var app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json()); // Parses incoming JSON requests
// Test route
app.get('/api/health', function (req, res) {
    res.json({ status: 'ok', message: 'Servidor rodando e Neon conectado!' });
});
// ---- HOTMART WEBHOOK ROUTE ---- //
app.post('/api/webhook/hotmart', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var payload, hottok, eventType, status_1, email, name_1, transactionId, productIdHotmart, dbUsers, userId, photo, result, systemProductId, error_1;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                _k.trys.push([0, 7, , 8]);
                payload = req.body;
                hottok = req.headers['x-hotmart-hottok'] || req.query.hottok || payload.hottok;
                if (process.env.HOTMART_HOTTOK && hottok !== process.env.HOTMART_HOTTOK) {
                    console.warn('Alerta: Token Hottok inválido recebido!');
                    return [2 /*return*/, res.status(401).json({ error: 'Unauthorized' })];
                }
                console.log('Webhook Recebido da Hotmart:', JSON.stringify(payload, null, 2));
                eventType = payload.event;
                status_1 = payload.status || ((_a = payload.data) === null || _a === void 0 ? void 0 : _a.status);
                email = ((_c = (_b = payload.data) === null || _b === void 0 ? void 0 : _b.buyer) === null || _c === void 0 ? void 0 : _c.email) || payload.email;
                name_1 = ((_e = (_d = payload.data) === null || _d === void 0 ? void 0 : _d.buyer) === null || _e === void 0 ? void 0 : _e.name) || payload.name || email.split('@')[0];
                transactionId = ((_g = (_f = payload.data) === null || _f === void 0 ? void 0 : _f.purchase) === null || _g === void 0 ? void 0 : _g.transaction) || payload.transaction;
                productIdHotmart = ((_j = (_h = payload.data) === null || _h === void 0 ? void 0 : _h.product) === null || _j === void 0 ? void 0 : _j.id) || payload.product_id;
                if (!(eventType === 'PURCHASE_APPROVED' || status_1 === 'APPROVED' || status_1 === 'COMPLETED' || payload.status === 'approved')) return [3 /*break*/, 6];
                if (!email) {
                    return [2 /*return*/, res.status(400).json({ error: 'Email não fornecido no payload.' })];
                }
                return [4 /*yield*/, (0, db_1.default)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT id FROM users WHERE email = ", ""], ["SELECT id FROM users WHERE email = ", ""])), email)];
            case 1:
                dbUsers = _k.sent();
                userId = void 0;
                if (!(dbUsers.length === 0)) return [3 /*break*/, 3];
                photo = "https://ui-avatars.com/api/?name=".concat(encodeURIComponent(name_1), "&background=3B82F6&color=fff");
                return [4 /*yield*/, (0, db_1.default)(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n                    INSERT INTO users (email, name, role, photo) \n                    VALUES (", ", ", ", 'student', ", ") \n                    RETURNING id\n                "], ["\n                    INSERT INTO users (email, name, role, photo) \n                    VALUES (", ", ", ", 'student', ", ") \n                    RETURNING id\n                "])), email, name_1, photo)];
            case 2:
                result = _k.sent();
                userId = result[0].id;
                console.log("Novo aluno criado: ".concat(email));
                return [3 /*break*/, 4];
            case 3:
                userId = dbUsers[0].id;
                console.log("Aluno j\u00E1 existe: ".concat(email));
                _k.label = 4;
            case 4:
                systemProductId = 'default';
                // Tenta inserir a permissão (ignora se já tiver)
                return [4 /*yield*/, (0, db_1.default)(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n                INSERT INTO product_access (user_id, product_id, transaction_id)\n                VALUES (", ", ", ", ", ")\n                ON CONFLICT (user_id, product_id) DO NOTHING\n            "], ["\n                INSERT INTO product_access (user_id, product_id, transaction_id)\n                VALUES (", ", ", ", ", ")\n                ON CONFLICT (user_id, product_id) DO NOTHING\n            "])), userId, systemProductId, transactionId)];
            case 5:
                // Tenta inserir a permissão (ignora se já tiver)
                _k.sent();
                console.log("Acesso liberado para: ".concat(email, " -> Produto: ").concat(systemProductId));
                _k.label = 6;
            case 6:
                res.status(200).json({ message: 'Webhook processado com sucesso.' });
                return [3 /*break*/, 8];
            case 7:
                error_1 = _k.sent();
                console.error('Erro ao processar Webhook Hotmart:', error_1);
                res.status(500).json({ error: 'Erro interno no servidor' });
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
// Inicia servidor e sincroniza banco de dados
var PORT = process.env.PORT || 3001;
(0, db_1.initDb)().then(function () {
    app.listen(PORT, function () {
        console.log("Servidor rodando na porta ".concat(PORT));
    });
}).catch(function (err) {
    console.error('Erro ao inicializar banco de dados:', err);
});
var templateObject_1, templateObject_2, templateObject_3;
