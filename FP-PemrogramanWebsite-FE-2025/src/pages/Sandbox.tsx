import { useState } from "react";
import { toast } from "react-hot-toast";

import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";

export default function Sandbox() {
  const [alertOpen, setAlertOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="w-full min-h-screen p-8 space-y-8 flex flex-col">
      {/* TYPOGRAPHY */}
      <Typography variant="h1">
        Taxing Laughter: The Joke Tax Chronicles
      </Typography>
      <Typography variant="h2">The People of the Kingdom</Typography>
      <Typography variant="h3">The Joke Tax</Typography>
      <Typography variant="h4">A Royal Decree</Typography>
      <Typography variant="p" className="text-gray-400">
        The king, seeing how much happier his subjects were, realized the error
        of his ways and repealed the joke tax.
      </Typography>
      <Typography variant="blockquote">
        "After all," he said, "everyone enjoys a good joke, so it's only fair
        that they should pay for the privilege."
      </Typography>
      <Typography variant="list">
        <li>1st level of puns: 5 gold coins</li>
        <li>2nd level of jokes: 10 gold coins</li>
        <li>3rd level of one-liners: 20 gold coins</li>
      </Typography>
      <Typography variant="inlineCode">@radix-ui/react-alert-dialog</Typography>
      <Typography variant="lead">
        A modal dialog that interrupts the user with important content and
        expects a response.
      </Typography>
      <Typography variant="large">Are you absolutely sure?</Typography>
      <Typography variant="small">This action cannot be undone.</Typography>
      <Typography variant="muted">Enter your email address.</Typography>

      {/* AVATAR */}
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Typography variant="p">Avatar component</Typography>
      </div>

      {/* BUTTON */}
      <Button onClick={() => toast.success("Button clicked!")}>Click Me</Button>

      {/* CARD */}
      <Card className="w-80">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Typography variant="p">Some content inside the card.</Typography>
        </CardContent>
        <CardFooter>
          <Button>Action</Button>
        </CardFooter>
      </Card>

      {/* INPUT & TEXTAREA */}
      <div className="flex flex-col space-y-2 w-64">
        <Label htmlFor="email" className="text-sky-800">
          Email
        </Label>
        <Input
          id="email"
          className="bg-zinc-100 text-zinc-600"
          placeholder="Enter your email"
        />
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Type something..." />
      </div>

      {/* SWITCH */}
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" />
        <Label htmlFor="airplane-mode">Airplane Mode</Label>
      </div>

      {/* TABS */}
      <Tabs defaultValue="tab1" className="w-64">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
        <TabsContent value="tab2">Content for Tab 2</TabsContent>
      </Tabs>

      {/* POPOVER */}
      <Popover>
        <PopoverTrigger asChild>
          <Button>Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="leading-none font-medium">Dimensions</h4>
              <p className="text-muted-foreground text-sm">
                Set the dimensions for the layer.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  defaultValue="100%"
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  defaultValue="25px"
                  className="col-span-2 h-8"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* ALERT DIALOG */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Open AlertDialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Example</DialogTitle>
            <DialogDescription>This is a Dialog component.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RADIO GROUP */}
      <div className="flex items-center gap-2">
        <RadioGroup defaultValue="option1" className="flex space-x-4">
          <RadioGroupItem value="option1" id="r1" />
          <Label htmlFor="r1">Option 1</Label>
          <RadioGroupItem value="option2" id="r2" />
          <Label htmlFor="r2">Option 2</Label>
        </RadioGroup>
      </div>

      {/* SELECT */}
      <Select>
        <SelectTrigger>Choose</SelectTrigger>
        <SelectContent>
          <SelectItem value="1">Option 1</SelectItem>
          <SelectItem value="2">Option 2</SelectItem>
        </SelectContent>
      </Select>

      {/* CHECKBOX */}
      <div className="flex items-start gap-3">
        <Checkbox id="terms-2" defaultChecked />
        <div className="grid gap-2">
          <Label htmlFor="terms-2">Accept terms and conditions</Label>
          <p className="text-muted-foreground text-sm">
            By clicking this checkbox, you agree to the terms and conditions.
          </p>
        </div>
      </div>

      {/* NAVIGATION MENU */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">Home</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="#">About</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* DROPDOWN MENU */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open Dropdown</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* CONTEXT MENU */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Button>Right Click Me</Button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Action 1</ContextMenuItem>
          <ContextMenuItem>Action 2</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* COMMAND */}
      <Command>
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandItem>Command 1</CommandItem>
          <CommandItem>Command 2</CommandItem>
        </CommandList>
      </Command>
    </div>
  );
}
