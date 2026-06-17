"use client";

import { Building2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useReceiptStore } from "@/lib/store/receipt-store";

export function BusinessInfoCard() {
  const business = useReceiptStore((state) => state.business);
  const setBusiness = useReceiptStore((state) => state.setBusiness);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBusiness({ logo: reader.result as string });
      toast.success("Logo uploaded");
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="receity-card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Business Information</CardTitle>
        </div>
        <CardDescription>
          Your details save on this device only — each person sets up their own
          shop
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Logo</Label>
          <div className="flex items-center gap-4">
            {business.logo ? (
              <div className="relative">
                <img
                  src={business.logo}
                  alt="Business logo"
                  className="h-16 w-16 rounded-lg border object-contain bg-white"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  className="absolute -right-2 -top-2 h-6 w-6 rounded-full"
                  onClick={() => setBusiness({ logo: null })}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <label className="flex h-16 w-16 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 transition-colors hover:bg-muted/50">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </label>
            )}
            {!business.logo && (
              <p className="text-sm text-muted-foreground">
                Upload your business logo (max 2MB)
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-name">Business Name</Label>
          <Input
            id="business-name"
            placeholder="Your Business Name"
            value={business.name}
            onChange={(e) => setBusiness({ name: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="business-phone">Phone Number</Label>
            <Input
              id="business-phone"
              placeholder="+254 7XX XXX XXX"
              value={business.phone}
              onChange={(e) => setBusiness({ phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-whatsapp">WhatsApp Number</Label>
            <Input
              id="business-whatsapp"
              placeholder="+254 7XX XXX XXX"
              value={business.whatsapp}
              onChange={(e) => setBusiness({ whatsapp: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="business-tiktok">TikTok</Label>
            <Input
              id="business-tiktok"
              placeholder="https://www.tiktok.com/@yourbusiness"
              value={business.tiktok}
              onChange={(e) => setBusiness({ tiktok: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="business-instagram">Instagram</Label>
            <Input
              id="business-instagram"
              placeholder="https://www.instagram.com/yourbusiness"
              value={business.instagram}
              onChange={(e) => setBusiness({ instagram: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-slogan">Tagline / Slogan</Label>
          <Input
            id="business-slogan"
            placeholder="Optional line on your receipt footer"
            value={business.slogan}
            onChange={(e) => setBusiness({ slogan: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="business-address">Address / Location</Label>
          <Textarea
            id="business-address"
            placeholder="Nairobi, Kenya"
            rows={2}
            value={business.address}
            onChange={(e) => setBusiness({ address: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}
