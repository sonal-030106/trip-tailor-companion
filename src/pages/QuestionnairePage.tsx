import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { MapPin, Users, Clock, Calendar as CalendarIcon, ArrowRight, DollarSign } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { addDays, format } from 'date-fns';
import { TravelQuestionnaire } from "@/components/TravelQuestionnaire";

const QuestionnairePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <TravelQuestionnaire />
        </Card>
      </div>
    </div>
  );
};

export default QuestionnairePage;
