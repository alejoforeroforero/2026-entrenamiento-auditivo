'use client';

import { useState } from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
  Avatar,
  Input,
  Tabs,
  Tab,
  Listbox,
  ListboxItem,
  ListboxSection,
  Accordion,
  AccordionItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Divider,
  Image,
  Progress,
} from '@heroui/react';
import {
  Headphones,
  Play,
  Pause,
  Heart,
  Search,
  Music,
  ChevronDown,
  Sun,
  Moon,
  User,
  Home,
  BookOpen,
  Mic,
  BarChart3,
} from 'lucide-react';

const mockSong = {
  title: 'Pedro Navaja',
  artist: 'Rubén Blades',
  key: 'F',
  mode: 'Mayor',
  progression: 'I-IV-V-I',
  thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
};

const progressions = [
  { id: '1', name: 'I-IV-V-I', level: 'Básico' },
  { id: '2', name: 'i-VII-V-V', level: 'Básico' },
  { id: '3', name: 'i-VII-VI-V', level: 'Básico' },
  { id: '4', name: 'ii-V-I', level: 'Intermedio' },
  { id: '5', name: 'I-vi-IV-V', level: 'Intermedio' },
];

export default function ExplorarDisenosPage() {
  const [activeDesign, setActiveDesign] = useState('1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-2">Exploración de Diseños HeroUI</h1>
        <p className="text-default-500 mb-8">
          Diferentes variantes para Header, Sidebar, Song Cards y Layout
        </p>

        <Tabs
          aria-label="Secciones de diseño"
          color="primary"
          variant="underlined"
          classNames={{
            tabList: "gap-6",
            cursor: "w-full",
          }}
        >
          {/* ===================== HEADERS ===================== */}
          <Tab key="headers" title="Headers">
            <div className="space-y-8 pt-6">
              <h2 className="text-xl font-semibold">Variantes de Header</h2>

              {/* Header 1: Minimal con Breadcrumb */}
              <Card>
                <CardHeader>
                  <Chip size="sm" color="primary" variant="flat">Opción 1</Chip>
                  <span className="ml-2 text-sm">Minimal con Breadcrumb integrado</span>
                </CardHeader>
                <CardBody className="p-0 overflow-hidden">
                  <Navbar className="bg-content1" maxWidth="full">
                    <NavbarBrand>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <Headphones className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">Progresiones</span>
                          <ChevronDown className="w-4 h-4 text-default-400" />
                          <Chip size="sm" variant="flat">Salsa</Chip>
                        </div>
                      </div>
                    </NavbarBrand>
                    <NavbarContent justify="end">
                      <NavbarItem>
                        <Button color="primary" variant="shadow" radius="full">
                          Practicar
                        </Button>
                      </NavbarItem>
                      <NavbarItem>
                        <Button isIconOnly variant="light" radius="full">
                          <Sun className="w-5 h-5" />
                        </Button>
                      </NavbarItem>
                      <NavbarItem>
                        <Avatar size="sm" name="US" />
                      </NavbarItem>
                    </NavbarContent>
                  </Navbar>
                </CardBody>
              </Card>

              {/* Header 2: Con tabs de navegación */}
              <Card>
                <CardHeader>
                  <Chip size="sm" color="secondary" variant="flat">Opción 2</Chip>
                  <span className="ml-2 text-sm">Con navegación por tabs</span>
                </CardHeader>
                <CardBody className="p-0 overflow-hidden">
                  <Navbar className="bg-content1" maxWidth="full">
                    <NavbarBrand>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Headphones className="w-5 h-5 text-white" />
                      </div>
                    </NavbarBrand>
                    <NavbarContent className="gap-1" justify="center">
                      <NavbarItem>
                        <Button variant="light" startContent={<Home className="w-4 h-4" />}>
                          Inicio
                        </Button>
                      </NavbarItem>
                      <NavbarItem isActive>
                        <Button variant="flat" color="primary" startContent={<Music className="w-4 h-4" />}>
                          Progresiones
                        </Button>
                      </NavbarItem>
                      <NavbarItem>
                        <Button variant="light" startContent={<Mic className="w-4 h-4" />}>
                          Dictado
                        </Button>
                      </NavbarItem>
                      <NavbarItem>
                        <Button variant="light" startContent={<BarChart3 className="w-4 h-4" />}>
                          Progreso
                        </Button>
                      </NavbarItem>
                    </NavbarContent>
                    <NavbarContent justify="end">
                      <NavbarItem>
                        <Dropdown>
                          <DropdownTrigger>
                            <Avatar
                              isBordered
                              as="button"
                              color="primary"
                              size="sm"
                              name="US"
                            />
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem key="profile">Mi Perfil</DropdownItem>
                            <DropdownItem key="stats">Estadísticas</DropdownItem>
                            <DropdownItem key="logout" color="danger">Salir</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </NavbarItem>
                    </NavbarContent>
                  </Navbar>
                </CardBody>
              </Card>

              {/* Header 3: Compacto con dropdown de género */}
              <Card>
                <CardHeader>
                  <Chip size="sm" color="success" variant="flat">Opción 3</Chip>
                  <span className="ml-2 text-sm">Compacto con selector de género</span>
                </CardHeader>
                <CardBody className="p-0 overflow-hidden">
                  <Navbar className="bg-content1" maxWidth="full" height="3.5rem">
                    <NavbarBrand>
                      <Headphones className="w-6 h-6 text-primary" />
                      <span className="font-bold ml-2">EA</span>
                    </NavbarBrand>
                    <NavbarContent justify="center">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            variant="bordered"
                            endContent={<ChevronDown className="w-4 h-4" />}
                            className="min-w-32"
                          >
                            🎺 Salsa
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem key="salsa">🎺 Salsa</DropdownItem>
                          <DropdownItem key="cumbia">🪘 Cumbia</DropdownItem>
                          <DropdownItem key="vallenato">🪗 Vallenato</DropdownItem>
                          <DropdownItem key="bambuco">🎸 Bambuco</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </NavbarContent>
                    <NavbarContent justify="end" className="gap-1">
                      <NavbarItem>
                        <Button size="sm" color="primary">Practicar</Button>
                      </NavbarItem>
                      <NavbarItem>
                        <Avatar size="sm" name="US" />
                      </NavbarItem>
                    </NavbarContent>
                  </Navbar>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* ===================== SIDEBARS ===================== */}
          <Tab key="sidebars" title="Sidebars">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">

              {/* Sidebar 1: Listbox con secciones */}
              <Card>
                <CardHeader className="flex-col items-start">
                  <Chip size="sm" color="primary" variant="flat">Opción 1</Chip>
                  <span className="text-sm mt-1">Listbox con secciones</span>
                </CardHeader>
                <CardBody className="p-2">
                  <Listbox
                    aria-label="Progresiones"
                    selectionMode="single"
                    selectedKeys={['1']}
                    classNames={{
                      list: "gap-1",
                    }}
                  >
                    <ListboxSection title="Básico" showDivider>
                      {progressions.filter(p => p.level === 'Básico').map(p => (
                        <ListboxItem
                          key={p.id}
                          startContent={<Music className="w-4 h-4 text-primary" />}
                        >
                          {p.name}
                        </ListboxItem>
                      ))}
                    </ListboxSection>
                    <ListboxSection title="Intermedio">
                      {progressions.filter(p => p.level === 'Intermedio').map(p => (
                        <ListboxItem
                          key={p.id}
                          startContent={<Music className="w-4 h-4 text-warning" />}
                        >
                          {p.name}
                        </ListboxItem>
                      ))}
                    </ListboxSection>
                  </Listbox>
                </CardBody>
              </Card>

              {/* Sidebar 2: Accordion expandido */}
              <Card>
                <CardHeader className="flex-col items-start">
                  <Chip size="sm" color="secondary" variant="flat">Opción 2</Chip>
                  <span className="text-sm mt-1">Accordion con badges</span>
                </CardHeader>
                <CardBody className="p-2">
                  <Accordion
                    selectionMode="multiple"
                    defaultExpandedKeys={['basico']}
                    variant="splitted"
                  >
                    <AccordionItem
                      key="basico"
                      aria-label="Básico"
                      title={
                        <div className="flex items-center gap-2">
                          <span>Básico</span>
                          <Badge content="3" color="primary" size="sm" />
                        </div>
                      }
                    >
                      <div className="space-y-1 pb-2">
                        {progressions.filter(p => p.level === 'Básico').map(p => (
                          <Button
                            key={p.id}
                            variant={p.id === '1' ? 'flat' : 'light'}
                            color={p.id === '1' ? 'primary' : 'default'}
                            className="w-full justify-start"
                            size="sm"
                          >
                            {p.name}
                          </Button>
                        ))}
                      </div>
                    </AccordionItem>
                    <AccordionItem
                      key="intermedio"
                      aria-label="Intermedio"
                      title={
                        <div className="flex items-center gap-2">
                          <span>Intermedio</span>
                          <Badge content="2" color="warning" size="sm" />
                        </div>
                      }
                    >
                      <div className="space-y-1 pb-2">
                        {progressions.filter(p => p.level === 'Intermedio').map(p => (
                          <Button
                            key={p.id}
                            variant="light"
                            className="w-full justify-start"
                            size="sm"
                          >
                            {p.name}
                          </Button>
                        ))}
                      </div>
                    </AccordionItem>
                  </Accordion>
                </CardBody>
              </Card>

              {/* Sidebar 3: Cards apiladas */}
              <Card>
                <CardHeader className="flex-col items-start">
                  <Chip size="sm" color="success" variant="flat">Opción 3</Chip>
                  <span className="text-sm mt-1">Mini cards apiladas</span>
                </CardHeader>
                <CardBody className="p-3 space-y-2">
                  <p className="text-xs text-default-500 font-medium px-1">BÁSICO</p>
                  {progressions.filter(p => p.level === 'Básico').map(p => (
                    <Card
                      key={p.id}
                      isPressable
                      isHoverable
                      className={p.id === '1' ? 'border-primary border-2' : ''}
                    >
                      <CardBody className="p-3 flex-row items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          p.id === '1' ? 'bg-primary text-primary-foreground' : 'bg-default-100'
                        }`}>
                          <Music className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{p.name}</span>
                      </CardBody>
                    </Card>
                  ))}
                  <Divider className="my-2" />
                  <p className="text-xs text-default-500 font-medium px-1">INTERMEDIO</p>
                  {progressions.filter(p => p.level === 'Intermedio').map(p => (
                    <Card key={p.id} isPressable isHoverable>
                      <CardBody className="p-3 flex-row items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center">
                          <Music className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{p.name}</span>
                      </CardBody>
                    </Card>
                  ))}
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* ===================== SONG CARDS ===================== */}
          <Tab key="songs" title="Song Cards">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">

              {/* Song Card 1: Horizontal compacto */}
              <Card>
                <CardHeader className="flex-col items-start">
                  <Chip size="sm" color="primary" variant="flat">Opción 1</Chip>
                  <span className="text-sm mt-1">Horizontal compacto</span>
                </CardHeader>
                <CardBody>
                  <Card className="bg-content2">
                    <CardBody className="p-3">
                      <div className="flex gap-4">
                        <div className="w-24 h-16 rounded-lg bg-default-200 flex items-center justify-center overflow-hidden">
                          <Play className="w-6 h-6 text-default-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{mockSong.title}</p>
                          <p className="text-xs text-default-500">{mockSong.artist}</p>
                          <div className="flex gap-2 mt-2">
                            <Chip size="sm" variant="flat">{mockSong.key} {mockSong.mode}</Chip>
                            <Chip size="sm" variant="dot" color="primary">{mockSong.progression}</Chip>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button isIconOnly size="sm" variant="light">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button isIconOnly size="sm" color="primary">
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </CardBody>
              </Card>

              {/* Song Card 2: Con imagen prominente */}
              <Card>
                <CardHeader className="flex-col items-start">
                  <Chip size="sm" color="secondary" variant="flat">Opción 2</Chip>
                  <span className="text-sm mt-1">Imagen prominente</span>
                </CardHeader>
                <CardBody>
                  <Card isHoverable className="bg-content2">
                    <CardBody className="p-0 overflow-hidden">
                      <div className="relative">
                        <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Music className="w-12 h-12 text-default-300" />
                        </div>
                        <Button
                          isIconOnly
                          color="primary"
                          radius="full"
                          className="absolute bottom-2 right-2 shadow-lg"
                        >
                          <Play className="w-5 h-5" />
                        </Button>
                        <Button
                          isIconOnly
                          variant="flat"
                          radius="full"
                          size="sm"
                          className="absolute top-2 right-2 bg-black/50"
                        >
                          <Heart className="w-4 h-4 text-white" />
                        </Button>
                      </div>
                      <div className="p-4">
                        <p className="font-semibold">{mockSong.title}</p>
                        <p className="text-sm text-default-500">{mockSong.artist}</p>
                        <div className="flex gap-2 mt-3">
                          <Chip size="sm" variant="bordered">{mockSong.key} {mockSong.mode}</Chip>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </CardBody>
              </Card>

              {/* Song Card 3: Lista minimal */}
              <Card>
                <CardHeader className="flex-col items-start">
                  <Chip size="sm" color="success" variant="flat">Opción 3</Chip>
                  <span className="text-sm mt-1">Lista minimal</span>
                </CardHeader>
                <CardBody>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-content2 transition-colors cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-default-100 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Play className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{mockSong.title}</p>
                          <p className="text-xs text-default-500">{mockSong.artist} • {mockSong.key}</p>
                        </div>
                        <Button isIconOnly variant="light" size="sm" className="opacity-0 group-hover:opacity-100">
                          <Heart className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Song Card 4: Con progreso de reproducción */}
              <Card>
                <CardHeader className="flex-col items-start">
                  <Chip size="sm" color="warning" variant="flat">Opción 4</Chip>
                  <span className="text-sm mt-1">Con progreso de reproducción</span>
                </CardHeader>
                <CardBody>
                  <Card className="bg-content2">
                    <CardBody className="p-4">
                      <div className="flex gap-4 items-center">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Music className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">{mockSong.title}</p>
                              <p className="text-sm text-default-500">{mockSong.artist}</p>
                            </div>
                            <Button isIconOnly variant="light" size="sm">
                              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-danger text-danger' : ''}`} />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Chip size="sm" variant="flat" color="primary">{mockSong.progression}</Chip>
                            <span className="text-xs text-default-400">{mockSong.key} {mockSong.mode}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Progress
                          size="sm"
                          value={35}
                          color="primary"
                          classNames={{
                            track: "h-1",
                          }}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-default-400">0:10</span>
                          <div className="flex gap-1">
                            <Button isIconOnly size="sm" variant="light">
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                          <span className="text-xs text-default-400">0:25</span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </CardBody>
              </Card>
            </div>
          </Tab>

          {/* ===================== FULL LAYOUTS ===================== */}
          <Tab key="layouts" title="Layouts Completos">
            <div className="space-y-8 pt-6">

              {/* Layout 1: Sidebar izquierdo tradicional */}
              <Card>
                <CardHeader className="flex-col items-start">
                  <Chip size="sm" color="primary" variant="flat">Layout 1</Chip>
                  <span className="text-sm mt-1">Sidebar izquierdo tradicional</span>
                </CardHeader>
                <CardBody className="p-0 overflow-hidden">
                  <div className="flex h-96">
                    <aside className="w-56 border-r border-divider p-3 bg-content1">
                      <Listbox aria-label="Nav" selectionMode="single" selectedKeys={['prog1']}>
                        <ListboxSection title="Básico">
                          <ListboxItem key="prog1" startContent={<Music className="w-4 h-4" />}>
                            I-IV-V-I
                          </ListboxItem>
                          <ListboxItem key="prog2" startContent={<Music className="w-4 h-4" />}>
                            i-VII-V-V
                          </ListboxItem>
                        </ListboxSection>
                      </Listbox>
                    </aside>
                    <main className="flex-1 p-6 bg-content2">
                      <h2 className="text-2xl font-bold">I-IV-V-I</h2>
                      <p className="text-default-500 mt-1">Cadencia perfecta, la más común</p>
                      <Button color="primary" className="mt-4" startContent={<Play className="w-4 h-4" />}>
                        Escuchar progresión
                      </Button>
                      <Input
                        placeholder="Buscar canciones..."
                        startContent={<Search className="w-4 h-4" />}
                        className="mt-6 max-w-md"
                        variant="bordered"
                      />
                    </main>
                  </div>
                </CardBody>
              </Card>

              {/* Layout 2: Header con filtros, contenido centrado */}
              <Card>
                <CardHeader className="flex-col items-start">
                  <Chip size="sm" color="secondary" variant="flat">Layout 2</Chip>
                  <span className="text-sm mt-1">Contenido centrado con filtros en header</span>
                </CardHeader>
                <CardBody className="p-0 overflow-hidden">
                  <div className="h-96 bg-content1">
                    <div className="border-b border-divider p-4 flex items-center gap-4">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button variant="bordered" endContent={<ChevronDown className="w-4 h-4" />}>
                            Básico
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem>Básico</DropdownItem>
                          <DropdownItem>Intermedio</DropdownItem>
                          <DropdownItem>Avanzado</DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                      <div className="flex gap-1">
                        {['I-IV-V-I', 'i-VII-V-V', 'i-VII-VI-V'].map((p, i) => (
                          <Chip
                            key={p}
                            variant={i === 0 ? 'solid' : 'bordered'}
                            color={i === 0 ? 'primary' : 'default'}
                            className="cursor-pointer"
                          >
                            {p}
                          </Chip>
                        ))}
                      </div>
                      <Input
                        placeholder="Buscar..."
                        startContent={<Search className="w-4 h-4" />}
                        className="max-w-xs ml-auto"
                        size="sm"
                      />
                    </div>
                    <main className="p-6 max-w-2xl mx-auto">
                      <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold">I-IV-V-I</h2>
                        <p className="text-default-500">Cadencia perfecta</p>
                        <Button color="primary" variant="shadow" className="mt-4">
                          <Play className="w-4 h-4 mr-2" /> Escuchar
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-default-500">3 canciones</p>
                        <Card isPressable isHoverable>
                          <CardBody className="flex-row items-center gap-4 p-3">
                            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Play className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">Pedro Navaja</p>
                              <p className="text-sm text-default-500">Rubén Blades</p>
                            </div>
                            <Chip size="sm">F Mayor</Chip>
                          </CardBody>
                        </Card>
                      </div>
                    </main>
                  </div>
                </CardBody>
              </Card>

              {/* Layout 3: Panel flotante */}
              <Card>
                <CardHeader className="flex-col items-start">
                  <Chip size="sm" color="success" variant="flat">Layout 3</Chip>
                  <span className="text-sm mt-1">Panel flotante con fondo gradiente</span>
                </CardHeader>
                <CardBody className="p-0 overflow-hidden">
                  <div className="h-96 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8 flex items-start justify-center">
                    <Card className="w-full max-w-3xl shadow-xl">
                      <CardHeader className="flex justify-between items-center pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold">I-IV-V-I</h2>
                            <p className="text-sm text-default-500">Cadencia perfecta</p>
                          </div>
                        </div>
                        <Button color="primary" startContent={<Play className="w-4 h-4" />}>
                          Escuchar
                        </Button>
                      </CardHeader>
                      <Divider className="my-4" />
                      <CardBody className="pt-0">
                        <Input
                          placeholder="Buscar canciones..."
                          startContent={<Search className="w-4 h-4" />}
                          variant="bordered"
                          className="mb-4"
                        />
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-content2 hover:bg-content3 transition-colors cursor-pointer">
                          <div className="w-14 h-10 rounded-lg bg-default-200 flex items-center justify-center">
                            <Play className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">Pedro Navaja</p>
                            <p className="text-xs text-default-500">Rubén Blades</p>
                          </div>
                          <Chip size="sm" variant="flat">F Mayor</Chip>
                          <Button isIconOnly variant="light" size="sm">
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button isIconOnly color="primary" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
