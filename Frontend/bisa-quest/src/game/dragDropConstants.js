import AssetManifest from "../services/AssetManifest";


//Scene backgrounds 
import houseBackground from "../assets/images/environments/scenario/house.png";
import kitchenBackground from "../assets/images/environments/scenario/kitchen.png";
import bedroomBackground from "../assets/images/environments/scenario/bedroom.png";

//Item images — Living Room
import BroomImg from "../assets/items/broom.png";
import DustpanImg from "../assets/items/dustpan.png";
import MopImg from "../assets/items/mop.png";
import PillowImg from "../assets/items/pillow.png";
import RagImg from "../assets/items/rag.png";
import SlipperImg from "../assets/items/slipper.png";
import TrashImg from "../assets/items/trash 1.png";
import BrushImg from "../assets/items/brush.png";
import TowelImg from "../assets/items/towel.png";
import BedsheetImg from "../assets/items/bedsheet.png";
import HabolImg from "../assets/items/habol.png";
import HandfanImg from "../assets/items/hand_fan.png";
import bucketImg from "../assets/items/bucket.png";
import BookImg from "../assets/items/book.png";
import KalendaryoImg from "../assets/items/kalendaryo.png";
import PurtahanImg from "../assets/items/purtahan.png";
import RugImg from "../assets/items/rug.png";
import PlangganaImg from "../assets/items/planggana.png";
import LamesaSalaImg from "../assets/items/lamesa_sala.png";
import BookshelfItemImg from "../assets/items/bookshelf_item.png";
import SopaImg from "../assets/items/sopa.png";
import BulakImg from "../assets/items/bulak.png";
import ToalyaImg from "../assets/items/toalya.png";
import BaldiImg from "../assets/items/baldi.png";
import LitratoImg from "../assets/items/litrato.png";
import BintanaImg from "../assets/items/bintana.png";
import KurtinaImg from "../assets/items/kurtina.png";
import BayongImg from "../assets/items/bayong.png";
import SalaCeilingImg from "../assets/items/sala_ceiling.png";
import SalogImg from "../assets/items/salog.png";
import DoormatImg from "../assets/items/doormat.png";
import EstanteWallImg from "../assets/items/estante_wall.png";

//Item images — Kitchen
import PotImg from "../assets/items/pot.png";
import PanImg from "../assets/items/pan.png";
import LadleImg from "../assets/items/ladle.png";
import KnifeImg from "../assets/items/knife.png";
import PlateImg from "../assets/items/plate.png";
import SpoonImg from "../assets/items/spoon.png";
import CupImg from "../assets/items/cup.png";
import KahoyImg from "../assets/items/kahoy.png";
import DruminImg from "../assets/items/drumin.png";
import RedCrateImg from "../assets/items/red_crate.png";
import Lababo from "../assets/items/lababo.png";
import LamesaImg from "../assets/items/lamesa.png";
import ShelfImg from "../assets/items/shelf.png";
import BigShelfImg from "../assets/items/big_shelf.png";
import DapoganImg from "../assets/items/dapogan.png";
import CarrotImg from "../assets/items/carrot.png";
import PotatoImg from "../assets/items/potato.png";
import OnionImg from "../assets/items/onion.png";

// Item images — Bedroom
import ShirtImg from "../assets/items/shirts.png";
import PantsImg from "../assets/items/pants.png";
import DressImg from "../assets/items/dress.png";
import ShoesImg from "../assets/items/shoes.png";
import electricFanImg from "../assets/items/electricfan.png";
import LaundryBasketImg from "../assets/items/laundry_basket.png";
import KatreImg from "../assets/items/katre.png";
import AparadorImg from "../assets/items/aparador.png";
import DustFeatherImg from "../assets/items/dust_feather.png";
import IronImg from "../assets/items/iron.png";
import LampOnImg from "../assets/items/lamp_on.png";
import LampOffImg from "../assets/items/lamp_off.png";
import BoxMatchImg from "../assets/items/box_match.png";
import LitMatchImg from "../assets/items/lit_match.png";
import MatchImg from "../assets/items/match.png";
import ReloImg from "../assets/items/relo.png";
import KisameImg from "../assets/items/kisame.png";


export const ITEM_IMAGE_MAP = {
  // Living room
  broom: BroomImg,
  walis: BroomImg,
  dustpan: DustpanImg,
  panlabay: DustpanImg,
  mop: MopImg,
  towel: TowelImg,
  habol: HabolImg,
  kumot: BedsheetImg,
  pillow: PillowImg,
  unan: PillowImg,
  abano: HandfanImg,
  rag: RagImg,
  trapo: RagImg,
  brush: BrushImg,
  slipper: SlipperImg,
  trash: TrashImg,
  basura: TrashImg,
  bucket: bucketImg,
  lamp: LampOffImg,
  book: BookImg,
  libro: BookImg,
  kalendaryo: KalendaryoImg,
  purtahan: PurtahanImg,
  alfombra: RugImg,
  planggana: PlangganaImg,
  lamesa_sala: LamesaSalaImg,
  relo: ReloImg,
  kisame: KisameImg,
  bookshelf: BookshelfItemImg,
  sopa: SopaImg,
  bulak: BulakImg,
  toalya: ToalyaImg,
  baldi: BaldiImg,
  litrato: LitratoImg,
  bintana: BintanaImg,
  kurtina: KurtinaImg,
  bag: BayongImg,
  sala_ceiling: SalaCeilingImg,
  salog: SalogImg,
  doormat: DoormatImg,
  estante_wall: EstanteWallImg,
  watering_can: AssetManifest.village.items.wateringCan,
  watering_can_pour: AssetManifest.village.items.wateringCanPour,
  hammer: AssetManifest.village.items.hammer,
  nail: AssetManifest.village.items.nail,
  kahoy: AssetManifest.village.items.kahoy,
  rag: AssetManifest.village.items.rag,
  dust_feather: AssetManifest.village.items.dust_feather,
  lampaso: AssetManifest.village.items.lampaso,
  shoes: AssetManifest.village.items.shoes,

  // Kitchen
  pot: PotImg,
  kaldero: PotImg,
  pan: PanImg,
  kawali: PanImg,
  ladle: LadleImg,
  sandok: LadleImg,
  knife: KnifeImg,
  kutsilyo: KnifeImg,
  plate: PlateImg,
  plato: PlateImg,
  spoon: SpoonImg,
  cup: CupImg,
  tasa: CupImg,
  carrot: CarrotImg,
  potato: PotatoImg,
  onion: OnionImg,
  kahoy: KahoyImg,
  drumin: DruminImg,
  red_crate: RedCrateImg,
  basket_kitchen: AssetManifest.village.scenarios.basket,
  lababo: Lababo,
  lamesa: LamesaImg,
  shelf: ShelfImg,
  big_shelf: BigShelfImg,
  firewood: KahoyImg,
  dapogan: DapoganImg,

  // Bedroom
  almohada: PillowImg,
  bedsheet: BedsheetImg,
  baro: ShirtImg,
  sinina: PantsImg,
  tuwalya: TowelImg,
  dress: DressImg,
  shoes: ShoesImg,
  laundry_basket: LaundryBasketImg,
  katre: KatreImg,
  Bentilador: electricFanImg,
  aparador: AparadorImg,
  paspas: DustFeatherImg,
  dust_feather: DustFeatherImg,
  iron: IronImg,
  plantsa: IronImg,
  lamp_on: LampOnImg,
  lamp_off: LampOffImg,
  box_match: BoxMatchImg,
  lit_match: LitMatchImg,
  match: MatchImg,

  // Castle library
  sunlight: AssetManifest.castle.scenarios.sun,
  candlelight: AssetManifest.castle.scenarios.candleStick,
  fireplace: AssetManifest.castle.scenarios.introFireplace,
  candlestick: AssetManifest.castle.scenarios.introCandlestick,
  bookshelf: AssetManifest.castle.scenarios.introBookshelf,
  keyhole: AssetManifest.castle.scenarios.key,
  doorway: AssetManifest.castle.scenarios.door,
  stonework: AssetManifest.castle.scenarios.introStone,
  grassland: AssetManifest.castle.scenarios.grass,
  pathway: AssetManifest.castle.scenarios.introPathway,
  waterway: AssetManifest.castle.scenarios.introWaterway,
  drawbridge: AssetManifest.castle.scenarios.introBridge,
  flagpole: AssetManifest.castle.scenarios.introFlagpole,
  archway: AssetManifest.castle.scenarios.introArchway,
  rooftop: AssetManifest.castle.scenarios.roof,
  courtyard: AssetManifest.castle.scenarios.introPatio,

};

// Scene backgrounds
export const SCENE_BACKGROUNDS = {
  living_room: houseBackground,
  kitchen: kitchenBackground,
  bedroom: bedroomBackground,

  living_room_spill: null,  // imported directly in HousePage
};

export const DEFAULT_BACKGROUND = houseBackground;

// Zone registry
export const ZONE_REGISTRY = {

  // Living room
  bookshelf: { label: "Bookshelf / Estante", x: 83, y: 40, w: 16, h: 50 },
  sofa: { label: "Sofa / Sopa", x: 50, y: 48, w: 20, h: 16 },
  aparador: { label: "Cabinet / Aparador", x: 73, y: 48, w: 10, h: 30 },
  lamesa: { label: "Table / Lamesa", x: 53, y: 64, w: 14, h: 10 },
  sulok: { label: "Corner / Sulok", x: 42, y: 40, w: 4, h: 24 },
  planggana: { label: "Basin / Planggana", x: 35, y: 62, w: 7, h: 8 },

  // Kitchen
  stove: { label: "Stove / Kalan", x: 57, y: 55, w: 10, h: 18 },
  counter: { label: "Counter / Kontra", x: 20, y: 55, w: 25, h: 20 },
  rack: { label: "Rack / Estante", x: 25, y: 28, w: 20, h: 20 },
  dish_rack: { label: "Dish Rack / Plahan", x: 78, y: 20, w: 20, h: 45 },
  ref: { label: "Ref / Ref", x: 67, y: 50, w: 8, h: 25 },
  sink: { label: "Sink / Lababo", x: 45, y: 52, w: 12, h: 22 },

  // Bedroom
  higdaanan: { label: "Bed / Higdaanan", x: 28, y: 50, w: 27, h: 20 },
  bedAparador: { label: "Wardrobe / Aparador", x: 70, y: 50, w: 10, h: 24 },
  salog: { label: "Floor / Salog", x: 30, y: 72, w: 40, h: 10 },
};

export const SCENE_ZONE_OVERRIDES = {
  bedroom: {
    aparador: { label: "Wardrobe / Aparador", x: 70, y: 50, w: 10, h: 24 },
  },
};

export const SCENE_ZONES = {
  living_room: ["bookshelf", "sofa", "aparador", "lamesa", "sulok", "planggana"],
  kitchen: ["stove", "counter", "rack", "dish_rack", "ref", "sink"],
  bedroom: ["higdaanan", "aparador", "salog"],
};

// DragAndDrop start positions
export const START_POSITIONS = [
  { x: 52, y: 44 },
  { x: 78, y: 72 },
  { x: 38, y: 78 },
  { x: 65, y: 58 },
  { x: 58, y: 82 },
  { x: 44, y: 62 },
];

// ItemAssociation scatter positions
export const IA_ITEM_POSITIONS = [
  { x: 72, y: 12 },
  { x: 55, y: 30 },
  { x: 82, y: 42 },
  { x: 72, y: 68 },
  { x: 55, y: 76 },
  { x: 42, y: 58 },
  { x: 30, y: 72 },
  { x: 14, y: 52 },
  { x: 25, y: 35 },
  { x: 45, y: 22 },
];

// Fallback items — Living Room
export const FALLBACK_ITEMS = [
  { id: "fb_1", label: "Broom / Walis", zone: "sulok", startX: 52, startY: 44, image: BroomImg },
  { id: "fb_2", label: "Dustpan / Panlabay", zone: "sulok", startX: 78, startY: 72, image: DustpanImg },
  { id: "fb_3", label: "Brush / Sipilyo", zone: "sulok", startX: 38, startY: 78, image: BrushImg },
  { id: "fb_4", label: "Mop / Mop", zone: "planggana", startX: 65, startY: 58, image: MopImg },
  { id: "fb_5", label: "Wet Rag / Trapo", zone: "planggana", startX: 58, startY: 82, image: RagImg },
  { id: "fb_6", label: "Bucket / Timba", zone: "planggana", startX: 44, startY: 62, image: null },
];

// Fallback items — Kitchen
export const FALLBACK_ITEMS_KITCHEN = [
  { id: "kb_1", label: "Pot / Kaldero", zone: "stove", startX: 52, startY: 44, image: PotImg },
  { id: "kb_2", label: "Pan / Kawali", zone: "stove", startX: 78, startY: 72, image: PanImg },
  { id: "kb_3", label: "Ladle / Sandok", zone: "rack", startX: 38, startY: 78, image: LadleImg },
  { id: "kb_4", label: "Knife / Kutsilyo", zone: "counter", startX: 65, startY: 58, image: KnifeImg },
  { id: "kb_5", label: "Plate / Plato", zone: "dish_rack", startX: 58, startY: 82, image: PlateImg },
  { id: "kb_6", label: "Cup / Tasa", zone: "dish_rack", startX: 44, startY: 62, image: CupImg },
];

// Fallback items — Bedroom
export const FALLBACK_ITEMS_BEDROOM = [
  { id: "bb_1", label: "Pillow / Almohada", zone: "higdaanan", startX: 52, startY: 44, image: PillowImg },
  { id: "bb_2", label: "Blanket / Habol", zone: "higdaanan", startX: 65, startY: 58, image: HabolImg },
  { id: "bb_3", label: "Bedsheet / Kumot", zone: "higdaanan", startX: 44, startY: 62, image: BedsheetImg },
  { id: "bb_4", label: "Shirt / Baro", zone: "aparador", startX: 78, startY: 72, image: ShirtImg },
  { id: "bb_5", label: "Pants / Sinina", zone: "aparador", startX: 38, startY: 78, image: PantsImg },
  { id: "bb_6", label: "Towel / Tuwalya", zone: "aparador", startX: 58, startY: 82, image: TowelImg },
];