import AssetManifest from "../services/AssetManifest";

//Scene backgrounds 
import houseBackground from "../assets/images/environments/scenario/house.jpg";
import kitchenBackground from "../assets/images/environments/scenario/kitchen.jpg";
import bedroomBackground from "../assets/images/environments/scenario/bedroom.jpg";

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
import electricFanImg from "../assets/items/electricfanRed.png";
import bucketImg from "../assets/items/bucket.png";
import lampImg from "../assets/items/lamp.png";
import BookImg from "../assets/items/book.png";

//Item images — Kitchen
import PotImg from "../assets/items/pot.png";
import PanImg from "../assets/items/pan.png";
import LadleImg from "../assets/items/ladle.png";
import KnifeImg from "../assets/items/knife.png";
import PlateImg from "../assets/items/plate.png";
import CupImg from "../assets/items/cup.png";

// Item images — Bedroom
import ShirtImg from "../assets/items/shirts.png";
import PantsImg from "../assets/items/pants.png";
import DressImg from "../assets/items/dress.jpg";
import ShoesImg from "../assets/items/shoes.png";

// Item images — Market Stall (fruits)
import MangoRipeImg from "../assets/items/mango.jpg";
import MangoUnripeImg from "../assets/items/mango_notripe.jpg";
import BananaRipeImg from "../assets/items/banana.jpg";
import BananaUnripeImg from "../assets/items/banana_notripe.jpg";
import watermelonImg from "../assets/items/fruit_watermelon.png";
import santolImg from "../assets/items/fruit_santol.png";
import lansonsesImg from "../assets/items/fruit_lansones.png";

//Item images - Farm
import WateringCanImg from "../assets/items/wateringCan.png";
import shovelImg from "../assets/items/shovel.png";
import kahoyImg from "../assets/items/kahoy.png";
import carabaoImg from "../assets/items/carabao.png";
import carabaoPlowImg from "../assets/items/carabao_nag-araro.png";
import chickenImg from "../assets/items/chicken.jpg";

// Scene backgrounds - Farm
import farmBackground from "../assets/images/environments/scenario/farm.png";
import emptyFarmBackground from "../assets/items/emptyFarm.png";

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
  Bentilador: electricFanImg,
  bucket: bucketImg,
  lamp: lampImg,
  book: BookImg,
  libro: BookImg,
  bag: AssetManifest.village.items.bag,

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
  cup: CupImg,
  tasa: CupImg,
  // Bedroom
  almohada: PillowImg,
  bedsheet: BedsheetImg,
  baro: ShirtImg,
  sinina: PantsImg,
  tuwalya: TowelImg,
  dress: DressImg,
  shoes: ShoesImg,
  // Market Stall — fruits
  mangga: MangoRipeImg,
  mango: MangoRipeImg,
  mangga_ripe: MangoRipeImg,
  mangga_unripe: MangoUnripeImg,
  mango_notripe: MangoUnripeImg,
  fruit_sour: MangoUnripeImg,   // comprehension wrong choice (sour/unripe)
  saging: BananaRipeImg,
  banana: BananaRipeImg,
  saging_ripe: BananaRipeImg,
  saging_unripe: BananaUnripeImg,
  banana_notripe: BananaUnripeImg,
  fruit_round: BananaUnripeImg,  // comprehension wrong choice (round/unripe)
  pakwan: watermelonImg,
  santol: santolImg,
  lansones: lansonsesImg,

  // Farm
  regadera: WateringCanImg,
  pala: shovelImg,
  kahoy: kahoyImg,
  kabaw: carabaoImg,
  carabao: carabaoImg,
  kabaw_river: carabaoImg,
  manok: chickenImg,
  chicken: chickenImg,
};

// Scene backgrounds
export const SCENE_BACKGROUNDS = {
  living_room: houseBackground,
  kitchen: kitchenBackground,
  bedroom: bedroomBackground,
  farm: farmBackground,
  empty_farm: emptyFarmBackground,
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