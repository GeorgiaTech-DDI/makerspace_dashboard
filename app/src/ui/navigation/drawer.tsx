"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings2, ChevronUp, ChevronDown } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { ComponentRegistry } from "../../../dashboard/dashboardComponentsList";

interface DashboardSettingsDrawerProps {
  selectedComponents: string[];
  componentOrder: string[];
  onSettingsSubmit: (data: { components: string[] }) => void;
  onOrderChange: (fromIndex: number, toIndex: number) => void;
  componentRegistry: ComponentRegistry;
}

const DashboardSettingsDrawer: React.FC<DashboardSettingsDrawerProps> = ({
  selectedComponents,
  componentOrder,
  onSettingsSubmit,
  onOrderChange,
  componentRegistry,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const form = useForm({
    defaultValues: {
      components: selectedComponents,
    },
  });

  const handleFormChange = () => {
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (data: { components: string[] }) => {
    setIsSaving(true);
    try {
      await onSettingsSubmit(data);
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings2 className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-background">
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="relative mx-auto w-full max-w-2xl bg-background">
          <DrawerHeader>
            <DrawerTitle>Dashboard Settings</DrawerTitle>
            <DrawerDescription>
              Choose which components to display and arrange their order.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4">
            <Form {...form}>
              <form
                onChange={handleFormChange}
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  {componentOrder.map((id, index) => (
                    <div
                      key={id}
                      className="flex items-center space-x-4 p-3 rounded-lg border bg-card"
                    >
                      <FormField
                        control={form.control}
                        name="components"
                        render={({ field }) => (
                          <FormItem className="flex flex-1 items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, id]);
                                  } else {
                                    field.onChange(
                                      field.value?.filter((v) => v !== id),
                                    );
                                  }
                                  setHasUnsavedChanges(true);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal flex-1">
                              {componentRegistry[id].label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === 0}
                          onClick={() => {
                            onOrderChange(index, index - 1);
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={index === componentOrder.length - 1}
                          onClick={() => {
                            onOrderChange(index, index + 1);
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <DrawerFooter className="px-0">
                  <Button
                    type="submit"
                    disabled={isSaving || !hasUnsavedChanges}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Close</Button>
                  </DrawerClose>
                </DrawerFooter>
              </form>
            </Form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DashboardSettingsDrawer;
