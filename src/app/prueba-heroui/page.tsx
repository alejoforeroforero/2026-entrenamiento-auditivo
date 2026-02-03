'use client';

import { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Input,
  Select,
  SelectItem,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Avatar,
  Tooltip,
  Tabs,
  Tab,
} from "@heroui/react";

const mockSongs = [
  { id: 1, title: "Pedro Navaja", artist: "Rubén Blades", genre: "Salsa", difficulty: "Intermedio", status: "active" },
  { id: 2, title: "La Bamba", artist: "Ritchie Valens", genre: "Rock", difficulty: "Fácil", status: "completed" },
  { id: 3, title: "La Gota Fría", artist: "Carlos Vives", genre: "Vallenato", difficulty: "Difícil", status: "pending" },
  { id: 4, title: "Quimbara", artist: "Celia Cruz", genre: "Salsa", difficulty: "Intermedio", status: "active" },
  { id: 5, title: "El Cantante", artist: "Héctor Lavoe", genre: "Salsa", difficulty: "Difícil", status: "pending" },
];

const genres = [
  { key: "salsa", label: "Salsa" },
  { key: "rock", label: "Rock en Español" },
  { key: "vallenato", label: "Vallenato" },
  { key: "cumbia", label: "Cumbia" },
  { key: "bambuco", label: "Bambuco" },
];

const statusColorMap: Record<string, "success" | "warning" | "danger"> = {
  active: "success",
  pending: "warning",
  completed: "danger",
};

export default function PruebaHeroUIPage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    aceptaTerminos: false,
  });

  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      {/*
        Diferencia vs shadcn: HeroUI incluye Navbar como componente built-in.
        En shadcn hay que construirlo manualmente con primitivos de Radix.
        HeroUI maneja estados responsive automáticamente.
      */}
      <Navbar isBordered>
        <NavbarBrand>
          <p className="font-bold text-inherit">HeroUI Demo</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              Inicio
            </Link>
          </NavbarItem>
          <NavbarItem isActive>
            <Link href="#" aria-current="page" color="primary">
              Componentes
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Documentación
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <Button color="primary" variant="flat">
              Iniciar Sesión
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">Showcase de HeroUI</h1>
        <p className="text-default-500 mb-8">
          Página de prueba para evaluar componentes de HeroUI vs shadcn/ui
        </p>

        {/* TABS */}
        <Tabs aria-label="Secciones" className="mb-8">
          <Tab key="buttons" title="Botones & Cards">
            <div className="space-y-8 pt-4">
              {/* BOTONES */}
              {/*
                Diferencia vs shadcn: HeroUI tiene más variantes built-in (solid, bordered,
                light, flat, faded, shadow, ghost). Los colores también están predefinidos
                (default, primary, secondary, success, warning, danger).
                shadcn usa CVA y requiere definir variantes manualmente.
              */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Botones</h2>
                <div className="flex flex-wrap gap-4">
                  <Button color="default">Default</Button>
                  <Button color="primary">Primary</Button>
                  <Button color="secondary">Secondary</Button>
                  <Button color="success">Success</Button>
                  <Button color="warning">Warning</Button>
                  <Button color="danger">Danger</Button>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <Button variant="solid" color="primary">Solid</Button>
                  <Button variant="bordered" color="primary">Bordered</Button>
                  <Button variant="light" color="primary">Light</Button>
                  <Button variant="flat" color="primary">Flat</Button>
                  <Button variant="faded" color="primary">Faded</Button>
                  <Button variant="shadow" color="primary">Shadow</Button>
                  <Button variant="ghost" color="primary">Ghost</Button>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <Button size="sm" color="primary">Small</Button>
                  <Button size="md" color="primary">Medium</Button>
                  <Button size="lg" color="primary">Large</Button>
                  <Button isLoading color="primary">Loading</Button>
                  <Button isDisabled color="primary">Disabled</Button>
                </div>
              </section>

              {/* CARDS */}
              {/*
                Diferencia vs shadcn: Similar estructura (Card, CardHeader, CardBody, CardFooter),
                pero HeroUI incluye props como isBlurred, isPressable, isHoverable que agregan
                efectos sin CSS adicional.
              */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex gap-3">
                      <Avatar name="SA" size="md" />
                      <div className="flex flex-col">
                        <p className="text-md">Salsa</p>
                        <p className="text-small text-default-500">12 canciones</p>
                      </div>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                      <p>Aprende los patrones rítmicos y armónicos característicos de la salsa.</p>
                    </CardBody>
                    <Divider />
                    <CardFooter>
                      <Button color="primary" size="sm">Comenzar</Button>
                    </CardFooter>
                  </Card>

                  <Card isBlurred className="bg-background/60 dark:bg-default-100/50">
                    <CardHeader>
                      <p className="text-md font-semibold">Card Blurred</p>
                    </CardHeader>
                    <CardBody>
                      <p>Esta card tiene el efecto isBlurred que agrega backdrop-blur.</p>
                    </CardBody>
                  </Card>

                  <Card isPressable isHoverable onPress={() => alert("Card presionada!")}>
                    <CardHeader>
                      <p className="text-md font-semibold">Card Interactiva</p>
                    </CardHeader>
                    <CardBody>
                      <p>Haz clic en esta card. Tiene isPressable e isHoverable.</p>
                    </CardBody>
                  </Card>
                </div>
              </section>
            </div>
          </Tab>

          <Tab key="forms" title="Formularios">
            <div className="space-y-8 pt-4">
              {/* FORMULARIO */}
              {/*
                Diferencia vs shadcn: Los inputs de HeroUI tienen más variantes visuales
                (underlined, bordered, faded, flat). También incluyen validación visual
                integrada con isInvalid y errorMessage.
                shadcn requiere react-hook-form y configuración manual para validación.
              */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Formulario</h2>
                <Card className="max-w-xl">
                  <CardBody className="gap-4">
                    <Input
                      label="Nombre"
                      placeholder="Ingresa tu nombre"
                      variant="bordered"
                      value={formData.nombre}
                      onValueChange={(value) => setFormData({ ...formData, nombre: value })}
                    />
                    <Input
                      label="Email"
                      placeholder="tu@email.com"
                      type="email"
                      variant="bordered"
                      value={formData.email}
                      onValueChange={(value) => setFormData({ ...formData, email: value })}
                    />
                    <Select
                      label="Género musical preferido"
                      placeholder="Selecciona un género"
                      variant="bordered"
                      selectedKeys={selectedGenre ? [selectedGenre] : []}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        setSelectedGenre(selected || "");
                      }}
                    >
                      {genres.map((genre) => (
                        <SelectItem key={genre.key}>{genre.label}</SelectItem>
                      ))}
                    </Select>
                    <Checkbox
                      isSelected={formData.aceptaTerminos}
                      onValueChange={(checked) =>
                        setFormData({ ...formData, aceptaTerminos: checked })
                      }
                    >
                      Acepto los términos y condiciones
                    </Checkbox>
                    <div className="flex gap-2">
                      <Button color="primary" onPress={onOpen}>
                        Enviar
                      </Button>
                      <Button variant="flat">Cancelar</Button>
                    </div>
                  </CardBody>
                </Card>

                <h3 className="text-lg font-semibold mt-6 mb-4">Variantes de Input</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <Input label="Flat" variant="flat" placeholder="Variante flat" />
                  <Input label="Bordered" variant="bordered" placeholder="Variante bordered" />
                  <Input label="Underlined" variant="underlined" placeholder="Variante underlined" />
                  <Input label="Faded" variant="faded" placeholder="Variante faded" />
                  <Input
                    label="Con error"
                    variant="bordered"
                    isInvalid
                    errorMessage="Este campo es requerido"
                  />
                  <Input
                    label="Deshabilitado"
                    variant="bordered"
                    isDisabled
                    value="No editable"
                  />
                </div>
              </section>
            </div>
          </Tab>

          <Tab key="table" title="Tabla">
            <div className="pt-4">
              {/* TABLA */}
              {/*
                Diferencia vs shadcn: HeroUI tiene Table como componente completo con
                sorting, selection, y pagination built-in.
                shadcn usa TanStack Table que es más flexible pero requiere más setup.
                HeroUI es más "out of the box", shadcn es más "build your own".
              */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Tabla de Canciones</h2>
                <Table aria-label="Tabla de canciones de ejemplo">
                  <TableHeader>
                    <TableColumn>CANCIÓN</TableColumn>
                    <TableColumn>ARTISTA</TableColumn>
                    <TableColumn>GÉNERO</TableColumn>
                    <TableColumn>DIFICULTAD</TableColumn>
                    <TableColumn>ESTADO</TableColumn>
                    <TableColumn>ACCIONES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {mockSongs.map((song) => (
                      <TableRow key={song.id}>
                        <TableCell>{song.title}</TableCell>
                        <TableCell>{song.artist}</TableCell>
                        <TableCell>{song.genre}</TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={
                              song.difficulty === "Fácil" ? "success" :
                              song.difficulty === "Intermedio" ? "warning" : "danger"
                            }
                          >
                            {song.difficulty}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            variant="dot"
                            color={statusColorMap[song.status]}
                          >
                            {song.status}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Tooltip content="Ver detalles">
                              <Button size="sm" variant="light" isIconOnly>
                                👁
                              </Button>
                            </Tooltip>
                            <Tooltip content="Practicar">
                              <Button size="sm" variant="light" color="primary" isIconOnly>
                                ▶
                              </Button>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>
            </div>
          </Tab>

          <Tab key="other" title="Otros">
            <div className="space-y-8 pt-4">
              {/* CHIPS & AVATARS */}
              <section>
                <h2 className="text-xl font-semibold mb-4">Chips</h2>
                <div className="flex flex-wrap gap-2">
                  <Chip>Default</Chip>
                  <Chip color="primary">Primary</Chip>
                  <Chip color="secondary">Secondary</Chip>
                  <Chip color="success">Success</Chip>
                  <Chip color="warning">Warning</Chip>
                  <Chip color="danger">Danger</Chip>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Chip variant="solid" color="primary">Solid</Chip>
                  <Chip variant="bordered" color="primary">Bordered</Chip>
                  <Chip variant="light" color="primary">Light</Chip>
                  <Chip variant="flat" color="primary">Flat</Chip>
                  <Chip variant="faded" color="primary">Faded</Chip>
                  <Chip variant="shadow" color="primary">Shadow</Chip>
                  <Chip variant="dot" color="primary">Dot</Chip>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Avatars</h2>
                <div className="flex gap-4 items-center">
                  <Avatar name="JD" />
                  <Avatar name="AB" color="primary" />
                  <Avatar name="CD" color="secondary" />
                  <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" />
                  <Avatar isBordered color="primary" src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Tooltips</h2>
                <div className="flex gap-4">
                  <Tooltip content="Tooltip arriba" placement="top">
                    <Button variant="bordered">Arriba</Button>
                  </Tooltip>
                  <Tooltip content="Tooltip abajo" placement="bottom">
                    <Button variant="bordered">Abajo</Button>
                  </Tooltip>
                  <Tooltip content="Tooltip izquierda" placement="left">
                    <Button variant="bordered">Izquierda</Button>
                  </Tooltip>
                  <Tooltip content="Tooltip derecha" placement="right">
                    <Button variant="bordered">Derecha</Button>
                  </Tooltip>
                </div>
              </section>
            </div>
          </Tab>
        </Tabs>

        {/* RESUMEN DE DIFERENCIAS */}
        <Card className="mt-8 bg-default-50">
          <CardHeader>
            <h2 className="text-xl font-semibold">Resumen: HeroUI vs shadcn/ui</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-success mb-2">Ventajas de HeroUI</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Más componentes out-of-the-box (Navbar, Table con features)</li>
                  <li>Sistema de variantes/colores consistente y predefinido</li>
                  <li>Menos configuración inicial requerida</li>
                  <li>Animaciones suaves incluidas (framer-motion)</li>
                  <li>Props declarativos (isBlurred, isPressable, isLoading)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-warning mb-2">Consideraciones</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Menos control granular que shadcn (copy-paste)</li>
                  <li>Bundle size mayor (187 packages adicionales)</li>
                  <li>Temas menos personalizables sin CSS override</li>
                  <li>Dependencia de la librería vs ownership del código</li>
                  <li>API diferente (useDisclosure vs estado manual)</li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>

      {/* MODAL */}
      {/*
        Diferencia vs shadcn: HeroUI usa useDisclosure hook para manejar estado.
        shadcn usa Dialog de Radix con open/onOpenChange más explícito.
        Ambos funcionan bien, HeroUI es más conciso.
      */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Formulario Enviado</ModalHeader>
              <ModalBody>
                <p>Datos recibidos:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Nombre: {formData.nombre || "(vacío)"}</li>
                  <li>Email: {formData.email || "(vacío)"}</li>
                  <li>Género: {selectedGenre || "(no seleccionado)"}</li>
                  <li>Términos: {formData.aceptaTerminos ? "Aceptados" : "No aceptados"}</li>
                </ul>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cerrar
                </Button>
                <Button color="primary" onPress={onClose}>
                  Aceptar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
