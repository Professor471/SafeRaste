import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Clock, 
  MapPin, 
  Volume2, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Plus, 
  Sliders, 
  Trash2, 
  Activity, 
  Zap, 
  Eye, 
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import L from 'leaflet';

// Define initial coordinates for the map centered around Deccan Gymkhana in Pune, India
const MAP_CENTER = [18.5220, 73.8450];

const INITIAL_SEGMENTS = [
  {
    "id": "seg_01",
    "name": "FC Road near Fergusson College gate",
    "coordinates": [
      [
        18.52387,
        73.83934
      ],
      [
        18.52399,
        73.83932
      ],
      [
        18.52408,
        73.83924
      ],
      [
        18.52423,
        73.83922
      ],
      [
        18.52474,
        73.8393
      ],
      [
        18.52462,
        73.84027
      ],
      [
        18.52456,
        73.84134
      ],
      [
        18.52622,
        73.84182
      ],
      [
        18.52819,
        73.84287
      ],
      [
        18.52848,
        73.84306
      ],
      [
        18.52839,
        73.84336
      ],
      [
        18.52839,
        73.84347
      ]
    ],
    "grid_cell": "18.5259,73.8415"
  },
  {
    "id": "seg_02",
    "name": "JM Road by the Shivaji Nagar crossing",
    "coordinates": [
      [
        18.5292,
        73.84579
      ],
      [
        18.53107,
        73.84579
      ],
      [
        18.53137,
        73.8446
      ],
      [
        18.53155,
        73.84479
      ],
      [
        18.5309,
        73.8473
      ],
      [
        18.53082,
        73.84743
      ],
      [
        18.53225,
        73.84787
      ],
      [
        18.53238,
        73.84801
      ],
      [
        18.53255,
        73.84826
      ],
      [
        18.53286,
        73.84901
      ],
      [
        18.53312,
        73.85007
      ],
      [
        18.53321,
        73.85006
      ],
      [
        18.53322,
        73.8501
      ]
    ],
    "grid_cell": "18.5312,73.8481"
  },
  {
    "id": "seg_03",
    "name": "MG Road near the Camp market",
    "coordinates": [
      [
        18.51564,
        73.87615
      ],
      [
        18.51569,
        73.87607
      ],
      [
        18.51572,
        73.87567
      ],
      [
        18.51665,
        73.87505
      ],
      [
        18.51857,
        73.87433
      ],
      [
        18.51978,
        73.87409
      ],
      [
        18.52004,
        73.87409
      ],
      [
        18.51808,
        73.88044
      ],
      [
        18.51802,
        73.8807
      ],
      [
        18.51803,
        73.8809
      ],
      [
        18.51829,
        73.88107
      ],
      [
        18.51938,
        73.88151
      ],
      [
        18.51998,
        73.88036
      ]
    ],
    "grid_cell": "18.5177,73.8782"
  },
  {
    "id": "seg_04",
    "name": "Baner Road near Balewadi connector",
    "coordinates": [
      [
        18.56157,
        73.77978
      ],
      [
        18.56155,
        73.77953
      ],
      [
        18.56415,
        73.77944
      ],
      [
        18.56415,
        73.77872
      ],
      [
        18.56423,
        73.77872
      ],
      [
        18.56419,
        73.78114
      ],
      [
        18.5638,
        73.78246
      ],
      [
        18.56357,
        73.78289
      ],
      [
        18.56373,
        73.78288
      ],
      [
        18.56407,
        73.78266
      ],
      [
        18.56456,
        73.78254
      ],
      [
        18.56458,
        73.78248
      ],
      [
        18.56466,
        73.78247
      ],
      [
        18.56471,
        73.78254
      ],
      [
        18.56463,
        73.78262
      ],
      [
        18.56467,
        73.78401
      ],
      [
        18.5654,
        73.78403
      ],
      [
        18.56541,
        73.78372
      ],
      [
        18.5655,
        73.78372
      ]
    ],
    "grid_cell": "18.5635,73.7818"
  },
  {
    "id": "seg_05",
    "name": "Koregaon Park Main Avenue",
    "coordinates": [
      [
        18.5342,
        73.89368
      ],
      [
        18.53455,
        73.8937
      ],
      [
        18.53455,
        73.89487
      ],
      [
        18.5346,
        73.89496
      ],
      [
        18.53587,
        73.89511
      ],
      [
        18.53653,
        73.8953
      ],
      [
        18.5366,
        73.89719
      ],
      [
        18.53821,
        73.89724
      ]
    ],
    "grid_cell": "18.5362,73.8956"
  },
  {
    "id": "seg_06",
    "name": "Senapati Bapat Road near university lane",
    "coordinates": [
      [
        18.5348,
        73.82674
      ],
      [
        18.53452,
        73.82673
      ],
      [
        18.53451,
        73.82621
      ],
      [
        18.53301,
        73.82627
      ],
      [
        18.53297,
        73.82878
      ],
      [
        18.53473,
        73.82886
      ],
      [
        18.53472,
        73.83009
      ],
      [
        18.53752,
        73.83016
      ],
      [
        18.53968,
        73.82966
      ],
      [
        18.53969,
        73.82976
      ],
      [
        18.53901,
        73.82997
      ],
      [
        18.53903,
        73.8302
      ],
      [
        18.53866,
        73.83044
      ]
    ],
    "grid_cell": "18.5368,73.8287"
  },
  {
    "id": "seg_07",
    "name": "Kalyani Nagar riverside access road",
    "coordinates": [
      [
        18.54619,
        73.904
      ],
      [
        18.54619,
        73.90394
      ],
      [
        18.54626,
        73.90395
      ],
      [
        18.54597,
        73.906
      ],
      [
        18.5478,
        73.90592
      ],
      [
        18.55006,
        73.90564
      ],
      [
        18.55176,
        73.90583
      ],
      [
        18.55235,
        73.90594
      ],
      [
        18.55226,
        73.90816
      ],
      [
        18.55189,
        73.90825
      ],
      [
        18.5509,
        73.90813
      ],
      [
        18.55082,
        73.90785
      ]
    ],
    "grid_cell": "18.5482,73.9060"
  },
  {
    "id": "seg_08",
    "name": "Shivaji Nagar station approach road",
    "coordinates": [
      [
        18.52823,
        73.84951
      ],
      [
        18.52857,
        73.85007
      ],
      [
        18.52984,
        73.8498
      ],
      [
        18.53017,
        73.84964
      ],
      [
        18.53137,
        73.8446
      ],
      [
        18.5366,
        73.85006
      ],
      [
        18.5369,
        73.85072
      ],
      [
        18.53585,
        73.85099
      ],
      [
        18.53448,
        73.8517
      ],
      [
        18.53353,
        73.85237
      ],
      [
        18.53206,
        73.85365
      ]
    ],
    "grid_cell": "18.5301,73.8517"
  },
  {
    "id": "seg_09",
    "name": "Aundh ITI road stretch",
    "coordinates": [
      [
        18.5589,
        73.80652
      ],
      [
        18.55962,
        73.8064
      ],
      [
        18.55992,
        73.80653
      ],
      [
        18.56047,
        73.80654
      ],
      [
        18.56053,
        73.8074
      ],
      [
        18.56249,
        73.80743
      ],
      [
        18.56242,
        73.80965
      ],
      [
        18.56311,
        73.80994
      ],
      [
        18.56323,
        73.81003
      ]
    ],
    "grid_cell": "18.5609,73.8085"
  },
  {
    "id": "seg_10",
    "name": "Kothrud Paud Road by the bus stop cluster",
    "coordinates": [
      [
        18.50541,
        73.80599
      ],
      [
        18.50719,
        73.80594
      ],
      [
        18.50701,
        73.80422
      ],
      [
        18.50705,
        73.80415
      ],
      [
        18.50713,
        73.80415
      ],
      [
        18.50716,
        73.8042
      ],
      [
        18.50751,
        73.8075
      ],
      [
        18.50764,
        73.80799
      ],
      [
        18.50814,
        73.80884
      ],
      [
        18.50824,
        73.80911
      ],
      [
        18.50831,
        73.80952
      ],
      [
        18.50938,
        73.80947
      ]
    ],
    "grid_cell": "18.5074,73.8078"
  }
];

const INITIAL_REPORTS = [
  {
    "report_id": "pune_01_01_morning",
    "segment_id": "seg_01",
    "time_bucket": "morning",
    "timestamp": "2026-06-20T02:36:00.000Z",
    "signal": "Mostly safe, but one short blind corner near parked scooters",
    "severity": "medium",
    "note": "Mostly safe, but one short blind corner near parked scooters",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_01_02_morning",
    "segment_id": "seg_01",
    "time_bucket": "morning",
    "timestamp": "2026-06-20T02:37:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_01_03_morning",
    "segment_id": "seg_01",
    "time_bucket": "morning",
    "timestamp": "2026-06-20T02:38:00.000Z",
    "signal": "Well-lit and calm with lots of people around",
    "severity": "low",
    "note": "Well-lit and calm with lots of people around",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_01_04_afternoon",
    "segment_id": "seg_01",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-20T08:44:00.000Z",
    "signal": "Felt safe; shops were open and the street was busy",
    "severity": "low",
    "note": "Felt safe; shops were open and the street was busy",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_01_05_afternoon",
    "segment_id": "seg_01",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-20T08:45:00.000Z",
    "signal": "Clear sight lines and steady foot traffic; comfortable walking",
    "severity": "low",
    "note": "Clear sight lines and steady foot traffic; comfortable walking",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_01_06_afternoon",
    "segment_id": "seg_01",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-20T08:46:00.000Z",
    "signal": "Generally fine, though traffic was moving quickly at the intersection",
    "severity": "medium",
    "note": "Generally fine, though traffic was moving quickly at the intersection",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_01_07_evening",
    "segment_id": "seg_01",
    "time_bucket": "evening",
    "timestamp": "2026-06-20T12:57:00.000Z",
    "signal": "Some caution near the bus stop, but the block was active",
    "severity": "medium",
    "note": "Some caution near the bus stop, but the block was active",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_01_08_evening",
    "segment_id": "seg_01",
    "time_bucket": "evening",
    "timestamp": "2026-06-20T12:58:00.000Z",
    "signal": "A little quieter, but lighting stayed good and I felt fine",
    "severity": "low",
    "note": "A little quieter, but lighting stayed good and I felt fine",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_01_09_night",
    "segment_id": "seg_01",
    "time_bucket": "night",
    "timestamp": "2026-06-20T15:54:00.000Z",
    "signal": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "severity": "high",
    "note": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_01_10_night",
    "segment_id": "seg_01",
    "time_bucket": "night",
    "timestamp": "2026-06-20T15:55:00.000Z",
    "signal": "Felt okay because the road was lit and there was steady movement",
    "severity": "medium",
    "note": "Felt okay because the road was lit and there was steady movement",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_01_11_night",
    "segment_id": "seg_01",
    "time_bucket": "night",
    "timestamp": "2026-06-20T15:56:00.000Z",
    "signal": "Caution needed - one shadowed section and fast-moving vehicles",
    "severity": "high",
    "note": "Caution needed - one shadowed section and fast-moving vehicles",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_01_12_night",
    "segment_id": "seg_01",
    "time_bucket": "night",
    "timestamp": "2026-06-20T15:57:00.000Z",
    "signal": "Brighter than expected; security guards and other walkers nearby",
    "severity": "medium",
    "note": "Brighter than expected; security guards and other walkers nearby",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_01_morning",
    "segment_id": "seg_02",
    "time_bucket": "morning",
    "timestamp": "2026-06-21T02:36:00.000Z",
    "signal": "Felt safe; shops were open and the street was busy",
    "severity": "low",
    "note": "Felt safe; shops were open and the street was busy",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_02_morning",
    "segment_id": "seg_02",
    "time_bucket": "morning",
    "timestamp": "2026-06-21T02:37:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_03_morning",
    "segment_id": "seg_02",
    "time_bucket": "morning",
    "timestamp": "2026-06-21T02:38:00.000Z",
    "signal": "Mostly safe, but one short blind corner near parked scooters",
    "severity": "medium",
    "note": "Mostly safe, but one short blind corner near parked scooters",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_04_afternoon",
    "segment_id": "seg_02",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-21T08:44:00.000Z",
    "signal": "Well-lit and calm with lots of people around",
    "severity": "low",
    "note": "Well-lit and calm with lots of people around",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_05_afternoon",
    "segment_id": "seg_02",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-21T08:45:00.000Z",
    "signal": "Felt safe; shops were open and the street was busy",
    "severity": "low",
    "note": "Felt safe; shops were open and the street was busy",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_06_afternoon",
    "segment_id": "seg_02",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-21T08:46:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_07_evening",
    "segment_id": "seg_02",
    "time_bucket": "evening",
    "timestamp": "2026-06-21T12:57:00.000Z",
    "signal": "Still okay; several pedestrians and open storefronts",
    "severity": "low",
    "note": "Still okay; several pedestrians and open storefronts",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_08_evening",
    "segment_id": "seg_02",
    "time_bucket": "evening",
    "timestamp": "2026-06-21T12:58:00.000Z",
    "signal": "Some caution near the bus stop, but the block was active",
    "severity": "medium",
    "note": "Some caution near the bus stop, but the block was active",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_09_night",
    "segment_id": "seg_02",
    "time_bucket": "night",
    "timestamp": "2026-06-21T15:54:00.000Z",
    "signal": "Brighter than expected; security guards and other walkers nearby",
    "severity": "medium",
    "note": "Brighter than expected; security guards and other walkers nearby",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_10_night",
    "segment_id": "seg_02",
    "time_bucket": "night",
    "timestamp": "2026-06-21T15:55:00.000Z",
    "signal": "Felt okay because the road was lit and there was steady movement",
    "severity": "medium",
    "note": "Felt okay because the road was lit and there was steady movement",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_11_night",
    "segment_id": "seg_02",
    "time_bucket": "night",
    "timestamp": "2026-06-21T15:56:00.000Z",
    "signal": "Felt okay because the road was lit and there was steady movement",
    "severity": "medium",
    "note": "Felt okay because the road was lit and there was steady movement",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_02_12_night",
    "segment_id": "seg_02",
    "time_bucket": "night",
    "timestamp": "2026-06-21T15:57:00.000Z",
    "signal": "Took care crossing because the block was dim and nearly empty",
    "severity": "high",
    "note": "Took care crossing because the block was dim and nearly empty",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_01_morning",
    "segment_id": "seg_03",
    "time_bucket": "morning",
    "timestamp": "2026-06-22T02:36:00.000Z",
    "signal": "Mostly safe, but one short blind corner near parked scooters",
    "severity": "medium",
    "note": "Mostly safe, but one short blind corner near parked scooters",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_02_morning",
    "segment_id": "seg_03",
    "time_bucket": "morning",
    "timestamp": "2026-06-22T02:37:00.000Z",
    "signal": "Mostly safe, but one short blind corner near parked scooters",
    "severity": "medium",
    "note": "Mostly safe, but one short blind corner near parked scooters",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_03_morning",
    "segment_id": "seg_03",
    "time_bucket": "morning",
    "timestamp": "2026-06-22T02:38:00.000Z",
    "signal": "Generally fine, though traffic was moving quickly at the intersection",
    "severity": "medium",
    "note": "Generally fine, though traffic was moving quickly at the intersection",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_04_afternoon",
    "segment_id": "seg_03",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-22T08:44:00.000Z",
    "signal": "Clear sight lines and steady foot traffic; comfortable walking",
    "severity": "low",
    "note": "Clear sight lines and steady foot traffic; comfortable walking",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_05_afternoon",
    "segment_id": "seg_03",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-22T08:45:00.000Z",
    "signal": "Well-lit and calm with lots of people around",
    "severity": "low",
    "note": "Well-lit and calm with lots of people around",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_06_afternoon",
    "segment_id": "seg_03",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-22T08:46:00.000Z",
    "signal": "Well-lit and calm with lots of people around",
    "severity": "low",
    "note": "Well-lit and calm with lots of people around",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_07_evening",
    "segment_id": "seg_03",
    "time_bucket": "evening",
    "timestamp": "2026-06-22T12:57:00.000Z",
    "signal": "Still okay; several pedestrians and open storefronts",
    "severity": "low",
    "note": "Still okay; several pedestrians and open storefronts",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_08_evening",
    "segment_id": "seg_03",
    "time_bucket": "evening",
    "timestamp": "2026-06-22T12:58:00.000Z",
    "signal": "A little quieter, but lighting stayed good and I felt fine",
    "severity": "low",
    "note": "A little quieter, but lighting stayed good and I felt fine",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_09_night",
    "segment_id": "seg_03",
    "time_bucket": "night",
    "timestamp": "2026-06-22T15:54:00.000Z",
    "signal": "Took care crossing because the block was dim and nearly empty",
    "severity": "high",
    "note": "Took care crossing because the block was dim and nearly empty",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_10_night",
    "segment_id": "seg_03",
    "time_bucket": "night",
    "timestamp": "2026-06-22T15:55:00.000Z",
    "signal": "Felt okay because the road was lit and there was steady movement",
    "severity": "medium",
    "note": "Felt okay because the road was lit and there was steady movement",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_11_night",
    "segment_id": "seg_03",
    "time_bucket": "night",
    "timestamp": "2026-06-22T15:56:00.000Z",
    "signal": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "severity": "high",
    "note": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_03_12_night",
    "segment_id": "seg_03",
    "time_bucket": "night",
    "timestamp": "2026-06-22T15:57:00.000Z",
    "signal": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "severity": "high",
    "note": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_01_morning",
    "segment_id": "seg_04",
    "time_bucket": "morning",
    "timestamp": "2026-06-23T02:36:00.000Z",
    "signal": "Generally fine, though traffic was moving quickly at the intersection",
    "severity": "medium",
    "note": "Generally fine, though traffic was moving quickly at the intersection",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_02_morning",
    "segment_id": "seg_04",
    "time_bucket": "morning",
    "timestamp": "2026-06-23T02:37:00.000Z",
    "signal": "Felt safe; shops were open and the street was busy",
    "severity": "low",
    "note": "Felt safe; shops were open and the street was busy",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_03_morning",
    "segment_id": "seg_04",
    "time_bucket": "morning",
    "timestamp": "2026-06-23T02:38:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_04_afternoon",
    "segment_id": "seg_04",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-23T08:44:00.000Z",
    "signal": "Clear sight lines and steady foot traffic; comfortable walking",
    "severity": "low",
    "note": "Clear sight lines and steady foot traffic; comfortable walking",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_05_afternoon",
    "segment_id": "seg_04",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-23T08:45:00.000Z",
    "signal": "Felt safe; shops were open and the street was busy",
    "severity": "low",
    "note": "Felt safe; shops were open and the street was busy",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_06_afternoon",
    "segment_id": "seg_04",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-23T08:46:00.000Z",
    "signal": "Felt safe; shops were open and the street was busy",
    "severity": "low",
    "note": "Felt safe; shops were open and the street was busy",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_07_evening",
    "segment_id": "seg_04",
    "time_bucket": "evening",
    "timestamp": "2026-06-23T12:57:00.000Z",
    "signal": "A little quieter, but lighting stayed good and I felt fine",
    "severity": "low",
    "note": "A little quieter, but lighting stayed good and I felt fine",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_08_evening",
    "segment_id": "seg_04",
    "time_bucket": "evening",
    "timestamp": "2026-06-23T12:58:00.000Z",
    "signal": "Still okay; several pedestrians and open storefronts",
    "severity": "low",
    "note": "Still okay; several pedestrians and open storefronts",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_09_night",
    "segment_id": "seg_04",
    "time_bucket": "night",
    "timestamp": "2026-06-23T15:54:00.000Z",
    "signal": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "severity": "high",
    "note": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_10_night",
    "segment_id": "seg_04",
    "time_bucket": "night",
    "timestamp": "2026-06-23T15:55:00.000Z",
    "signal": "Caution needed - one shadowed section and fast-moving vehicles",
    "severity": "high",
    "note": "Caution needed - one shadowed section and fast-moving vehicles",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_11_night",
    "segment_id": "seg_04",
    "time_bucket": "night",
    "timestamp": "2026-06-23T15:56:00.000Z",
    "signal": "Caution needed - one shadowed section and fast-moving vehicles",
    "severity": "high",
    "note": "Caution needed - one shadowed section and fast-moving vehicles",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_04_12_night",
    "segment_id": "seg_04",
    "time_bucket": "night",
    "timestamp": "2026-06-23T15:57:00.000Z",
    "signal": "Took care crossing because the block was dim and nearly empty",
    "severity": "high",
    "note": "Took care crossing because the block was dim and nearly empty",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_01_morning",
    "segment_id": "seg_05",
    "time_bucket": "morning",
    "timestamp": "2026-06-24T02:36:00.000Z",
    "signal": "Mostly safe, but one short blind corner near parked scooters",
    "severity": "medium",
    "note": "Mostly safe, but one short blind corner near parked scooters",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_02_morning",
    "segment_id": "seg_05",
    "time_bucket": "morning",
    "timestamp": "2026-06-24T02:37:00.000Z",
    "signal": "Clear sight lines and steady foot traffic; comfortable walking",
    "severity": "low",
    "note": "Clear sight lines and steady foot traffic; comfortable walking",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_03_morning",
    "segment_id": "seg_05",
    "time_bucket": "morning",
    "timestamp": "2026-06-24T02:38:00.000Z",
    "signal": "Clear sight lines and steady foot traffic; comfortable walking",
    "severity": "low",
    "note": "Clear sight lines and steady foot traffic; comfortable walking",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_04_afternoon",
    "segment_id": "seg_05",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-24T08:44:00.000Z",
    "signal": "Generally fine, though traffic was moving quickly at the intersection",
    "severity": "medium",
    "note": "Generally fine, though traffic was moving quickly at the intersection",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_05_afternoon",
    "segment_id": "seg_05",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-24T08:45:00.000Z",
    "signal": "Well-lit and calm with lots of people around",
    "severity": "low",
    "note": "Well-lit and calm with lots of people around",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_06_afternoon",
    "segment_id": "seg_05",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-24T08:46:00.000Z",
    "signal": "Mostly safe, but one short blind corner near parked scooters",
    "severity": "medium",
    "note": "Mostly safe, but one short blind corner near parked scooters",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_07_evening",
    "segment_id": "seg_05",
    "time_bucket": "evening",
    "timestamp": "2026-06-24T12:57:00.000Z",
    "signal": "Some caution near the bus stop, but the block was active",
    "severity": "medium",
    "note": "Some caution near the bus stop, but the block was active",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_08_evening",
    "segment_id": "seg_05",
    "time_bucket": "evening",
    "timestamp": "2026-06-24T12:58:00.000Z",
    "signal": "Still okay; several pedestrians and open storefronts",
    "severity": "low",
    "note": "Still okay; several pedestrians and open storefronts",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_09_night",
    "segment_id": "seg_05",
    "time_bucket": "night",
    "timestamp": "2026-06-24T15:54:00.000Z",
    "signal": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "severity": "high",
    "note": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_10_night",
    "segment_id": "seg_05",
    "time_bucket": "night",
    "timestamp": "2026-06-24T15:55:00.000Z",
    "signal": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "severity": "high",
    "note": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_11_night",
    "segment_id": "seg_05",
    "time_bucket": "night",
    "timestamp": "2026-06-24T15:56:00.000Z",
    "signal": "Unsafe - poor lighting and a dark stretch made the walk uncomfortable",
    "severity": "high",
    "note": "Unsafe - poor lighting and a dark stretch made the walk uncomfortable",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_05_12_night",
    "segment_id": "seg_05",
    "time_bucket": "night",
    "timestamp": "2026-06-24T15:57:00.000Z",
    "signal": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "severity": "high",
    "note": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_01_morning",
    "segment_id": "seg_06",
    "time_bucket": "morning",
    "timestamp": "2026-06-25T02:36:00.000Z",
    "signal": "Clear sight lines and steady foot traffic; comfortable walking",
    "severity": "low",
    "note": "Clear sight lines and steady foot traffic; comfortable walking",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_02_morning",
    "segment_id": "seg_06",
    "time_bucket": "morning",
    "timestamp": "2026-06-25T02:37:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_03_morning",
    "segment_id": "seg_06",
    "time_bucket": "morning",
    "timestamp": "2026-06-25T02:38:00.000Z",
    "signal": "Generally fine, though traffic was moving quickly at the intersection",
    "severity": "medium",
    "note": "Generally fine, though traffic was moving quickly at the intersection",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_04_afternoon",
    "segment_id": "seg_06",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-25T08:44:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_05_afternoon",
    "segment_id": "seg_06",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-25T08:45:00.000Z",
    "signal": "Felt safe; shops were open and the street was busy",
    "severity": "low",
    "note": "Felt safe; shops were open and the street was busy",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_06_afternoon",
    "segment_id": "seg_06",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-25T08:46:00.000Z",
    "signal": "Generally fine, though traffic was moving quickly at the intersection",
    "severity": "medium",
    "note": "Generally fine, though traffic was moving quickly at the intersection",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_07_evening",
    "segment_id": "seg_06",
    "time_bucket": "evening",
    "timestamp": "2026-06-25T12:57:00.000Z",
    "signal": "A little quieter, but lighting stayed good and I felt fine",
    "severity": "low",
    "note": "A little quieter, but lighting stayed good and I felt fine",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_08_evening",
    "segment_id": "seg_06",
    "time_bucket": "evening",
    "timestamp": "2026-06-25T12:58:00.000Z",
    "signal": "Some caution near the bus stop, but the block was active",
    "severity": "medium",
    "note": "Some caution near the bus stop, but the block was active",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_09_night",
    "segment_id": "seg_06",
    "time_bucket": "night",
    "timestamp": "2026-06-25T15:54:00.000Z",
    "signal": "Brighter than expected; security guards and other walkers nearby",
    "severity": "medium",
    "note": "Brighter than expected; security guards and other walkers nearby",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_10_night",
    "segment_id": "seg_06",
    "time_bucket": "night",
    "timestamp": "2026-06-25T15:55:00.000Z",
    "signal": "Caution needed - one shadowed section and fast-moving vehicles",
    "severity": "high",
    "note": "Caution needed - one shadowed section and fast-moving vehicles",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_11_night",
    "segment_id": "seg_06",
    "time_bucket": "night",
    "timestamp": "2026-06-25T15:56:00.000Z",
    "signal": "Took care crossing because the block was dim and nearly empty",
    "severity": "high",
    "note": "Took care crossing because the block was dim and nearly empty",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_06_12_night",
    "segment_id": "seg_06",
    "time_bucket": "night",
    "timestamp": "2026-06-25T15:57:00.000Z",
    "signal": "Felt okay because the road was lit and there was steady movement",
    "severity": "medium",
    "note": "Felt okay because the road was lit and there was steady movement",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_01_morning",
    "segment_id": "seg_07",
    "time_bucket": "morning",
    "timestamp": "2026-06-26T02:36:00.000Z",
    "signal": "Clear sight lines and steady foot traffic; comfortable walking",
    "severity": "low",
    "note": "Clear sight lines and steady foot traffic; comfortable walking",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_02_morning",
    "segment_id": "seg_07",
    "time_bucket": "morning",
    "timestamp": "2026-06-26T02:37:00.000Z",
    "signal": "Mostly safe, but one short blind corner near parked scooters",
    "severity": "medium",
    "note": "Mostly safe, but one short blind corner near parked scooters",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_03_morning",
    "segment_id": "seg_07",
    "time_bucket": "morning",
    "timestamp": "2026-06-26T02:38:00.000Z",
    "signal": "Generally fine, though traffic was moving quickly at the intersection",
    "severity": "medium",
    "note": "Generally fine, though traffic was moving quickly at the intersection",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_04_afternoon",
    "segment_id": "seg_07",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-26T08:44:00.000Z",
    "signal": "Mostly safe, but one short blind corner near parked scooters",
    "severity": "medium",
    "note": "Mostly safe, but one short blind corner near parked scooters",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_05_afternoon",
    "segment_id": "seg_07",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-26T08:45:00.000Z",
    "signal": "Well-lit and calm with lots of people around",
    "severity": "low",
    "note": "Well-lit and calm with lots of people around",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_06_afternoon",
    "segment_id": "seg_07",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-26T08:46:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_07_evening",
    "segment_id": "seg_07",
    "time_bucket": "evening",
    "timestamp": "2026-06-26T12:57:00.000Z",
    "signal": "Still okay; several pedestrians and open storefronts",
    "severity": "low",
    "note": "Still okay; several pedestrians and open storefronts",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_08_evening",
    "segment_id": "seg_07",
    "time_bucket": "evening",
    "timestamp": "2026-06-26T12:58:00.000Z",
    "signal": "A little quieter, but lighting stayed good and I felt fine",
    "severity": "low",
    "note": "A little quieter, but lighting stayed good and I felt fine",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_09_night",
    "segment_id": "seg_07",
    "time_bucket": "night",
    "timestamp": "2026-06-26T15:54:00.000Z",
    "signal": "Caution needed - one shadowed section and fast-moving vehicles",
    "severity": "high",
    "note": "Caution needed - one shadowed section and fast-moving vehicles",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_10_night",
    "segment_id": "seg_07",
    "time_bucket": "night",
    "timestamp": "2026-06-26T15:55:00.000Z",
    "signal": "Took care crossing because the block was dim and nearly empty",
    "severity": "high",
    "note": "Took care crossing because the block was dim and nearly empty",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_11_night",
    "segment_id": "seg_07",
    "time_bucket": "night",
    "timestamp": "2026-06-26T15:56:00.000Z",
    "signal": "Caution needed - one shadowed section and fast-moving vehicles",
    "severity": "high",
    "note": "Caution needed - one shadowed section and fast-moving vehicles",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_07_12_night",
    "segment_id": "seg_07",
    "time_bucket": "night",
    "timestamp": "2026-06-26T15:57:00.000Z",
    "signal": "Caution needed - one shadowed section and fast-moving vehicles",
    "severity": "high",
    "note": "Caution needed - one shadowed section and fast-moving vehicles",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_01_morning",
    "segment_id": "seg_08",
    "time_bucket": "morning",
    "timestamp": "2026-06-27T02:36:00.000Z",
    "signal": "Well-lit and calm with lots of people around",
    "severity": "low",
    "note": "Well-lit and calm with lots of people around",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_02_morning",
    "segment_id": "seg_08",
    "time_bucket": "morning",
    "timestamp": "2026-06-27T02:37:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_03_morning",
    "segment_id": "seg_08",
    "time_bucket": "morning",
    "timestamp": "2026-06-27T02:38:00.000Z",
    "signal": "Well-lit and calm with lots of people around",
    "severity": "low",
    "note": "Well-lit and calm with lots of people around",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_04_afternoon",
    "segment_id": "seg_08",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-27T08:44:00.000Z",
    "signal": "Felt safe; shops were open and the street was busy",
    "severity": "low",
    "note": "Felt safe; shops were open and the street was busy",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_05_afternoon",
    "segment_id": "seg_08",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-27T08:45:00.000Z",
    "signal": "Well-lit and calm with lots of people around",
    "severity": "low",
    "note": "Well-lit and calm with lots of people around",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_06_afternoon",
    "segment_id": "seg_08",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-27T08:46:00.000Z",
    "signal": "Felt safe; shops were open and the street was busy",
    "severity": "low",
    "note": "Felt safe; shops were open and the street was busy",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_07_evening",
    "segment_id": "seg_08",
    "time_bucket": "evening",
    "timestamp": "2026-06-27T12:57:00.000Z",
    "signal": "Still okay; several pedestrians and open storefronts",
    "severity": "low",
    "note": "Still okay; several pedestrians and open storefronts",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_08_evening",
    "segment_id": "seg_08",
    "time_bucket": "evening",
    "timestamp": "2026-06-27T12:58:00.000Z",
    "signal": "A little quieter, but lighting stayed good and I felt fine",
    "severity": "low",
    "note": "A little quieter, but lighting stayed good and I felt fine",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_09_night",
    "segment_id": "seg_08",
    "time_bucket": "night",
    "timestamp": "2026-06-27T15:54:00.000Z",
    "signal": "Felt okay because the road was lit and there was steady movement",
    "severity": "medium",
    "note": "Felt okay because the road was lit and there was steady movement",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_10_night",
    "segment_id": "seg_08",
    "time_bucket": "night",
    "timestamp": "2026-06-27T15:55:00.000Z",
    "signal": "Unsafe - poor lighting and a dark stretch made the walk uncomfortable",
    "severity": "high",
    "note": "Unsafe - poor lighting and a dark stretch made the walk uncomfortable",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_11_night",
    "segment_id": "seg_08",
    "time_bucket": "night",
    "timestamp": "2026-06-27T15:56:00.000Z",
    "signal": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "severity": "high",
    "note": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_08_12_night",
    "segment_id": "seg_08",
    "time_bucket": "night",
    "timestamp": "2026-06-27T15:57:00.000Z",
    "signal": "Felt okay because the road was lit and there was steady movement",
    "severity": "medium",
    "note": "Felt okay because the road was lit and there was steady movement",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_01_morning",
    "segment_id": "seg_09",
    "time_bucket": "morning",
    "timestamp": "2026-06-28T02:36:00.000Z",
    "signal": "Mostly safe, but one short blind corner near parked scooters",
    "severity": "medium",
    "note": "Mostly safe, but one short blind corner near parked scooters",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_02_morning",
    "segment_id": "seg_09",
    "time_bucket": "morning",
    "timestamp": "2026-06-28T02:37:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_03_morning",
    "segment_id": "seg_09",
    "time_bucket": "morning",
    "timestamp": "2026-06-28T02:38:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_04_afternoon",
    "segment_id": "seg_09",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-28T08:44:00.000Z",
    "signal": "Well-lit and calm with lots of people around",
    "severity": "low",
    "note": "Well-lit and calm with lots of people around",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_05_afternoon",
    "segment_id": "seg_09",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-28T08:45:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_06_afternoon",
    "segment_id": "seg_09",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-28T08:46:00.000Z",
    "signal": "Felt safe; shops were open and the street was busy",
    "severity": "low",
    "note": "Felt safe; shops were open and the street was busy",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_07_evening",
    "segment_id": "seg_09",
    "time_bucket": "evening",
    "timestamp": "2026-06-28T12:57:00.000Z",
    "signal": "Still okay; several pedestrians and open storefronts",
    "severity": "low",
    "note": "Still okay; several pedestrians and open storefronts",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_08_evening",
    "segment_id": "seg_09",
    "time_bucket": "evening",
    "timestamp": "2026-06-28T12:58:00.000Z",
    "signal": "Some caution near the bus stop, but the block was active",
    "severity": "medium",
    "note": "Some caution near the bus stop, but the block was active",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_09_night",
    "segment_id": "seg_09",
    "time_bucket": "night",
    "timestamp": "2026-06-28T15:54:00.000Z",
    "signal": "Caution needed - one shadowed section and fast-moving vehicles",
    "severity": "high",
    "note": "Caution needed - one shadowed section and fast-moving vehicles",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_10_night",
    "segment_id": "seg_09",
    "time_bucket": "night",
    "timestamp": "2026-06-28T15:55:00.000Z",
    "signal": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "severity": "high",
    "note": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_11_night",
    "segment_id": "seg_09",
    "time_bucket": "night",
    "timestamp": "2026-06-28T15:56:00.000Z",
    "signal": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "severity": "high",
    "note": "Uneasy near the corner; lighting dropped off and traffic felt sparse",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_09_12_night",
    "segment_id": "seg_09",
    "time_bucket": "night",
    "timestamp": "2026-06-28T15:57:00.000Z",
    "signal": "Brighter than expected; security guards and other walkers nearby",
    "severity": "medium",
    "note": "Brighter than expected; security guards and other walkers nearby",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_01_morning",
    "segment_id": "seg_10",
    "time_bucket": "morning",
    "timestamp": "2026-06-29T02:36:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_02_morning",
    "segment_id": "seg_10",
    "time_bucket": "morning",
    "timestamp": "2026-06-29T02:37:00.000Z",
    "signal": "Safe - high visibility, active pedestrian traffic",
    "severity": "low",
    "note": "Safe - high visibility, active pedestrian traffic",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_03_morning",
    "segment_id": "seg_10",
    "time_bucket": "morning",
    "timestamp": "2026-06-29T02:38:00.000Z",
    "signal": "Generally fine, though traffic was moving quickly at the intersection",
    "severity": "medium",
    "note": "Generally fine, though traffic was moving quickly at the intersection",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_04_afternoon",
    "segment_id": "seg_10",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-29T08:44:00.000Z",
    "signal": "Felt safe; shops were open and the street was busy",
    "severity": "low",
    "note": "Felt safe; shops were open and the street was busy",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_05_afternoon",
    "segment_id": "seg_10",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-29T08:45:00.000Z",
    "signal": "Generally fine, though traffic was moving quickly at the intersection",
    "severity": "medium",
    "note": "Generally fine, though traffic was moving quickly at the intersection",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_06_afternoon",
    "segment_id": "seg_10",
    "time_bucket": "afternoon",
    "timestamp": "2026-06-29T08:46:00.000Z",
    "signal": "Well-lit and calm with lots of people around",
    "severity": "low",
    "note": "Well-lit and calm with lots of people around",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_07_evening",
    "segment_id": "seg_10",
    "time_bucket": "evening",
    "timestamp": "2026-06-29T12:57:00.000Z",
    "signal": "Some caution near the bus stop, but the block was active",
    "severity": "medium",
    "note": "Some caution near the bus stop, but the block was active",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_08_evening",
    "segment_id": "seg_10",
    "time_bucket": "evening",
    "timestamp": "2026-06-29T12:58:00.000Z",
    "signal": "Still okay; several pedestrians and open storefronts",
    "severity": "low",
    "note": "Still okay; several pedestrians and open storefronts",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_09_night",
    "segment_id": "seg_10",
    "time_bucket": "night",
    "timestamp": "2026-06-29T15:54:00.000Z",
    "signal": "Felt okay because the road was lit and there was steady movement",
    "severity": "medium",
    "note": "Felt okay because the road was lit and there was steady movement",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_10_night",
    "segment_id": "seg_10",
    "time_bucket": "night",
    "timestamp": "2026-06-29T15:55:00.000Z",
    "signal": "Unsafe - poor lighting and a dark stretch made the walk uncomfortable",
    "severity": "high",
    "note": "Unsafe - poor lighting and a dark stretch made the walk uncomfortable",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_11_night",
    "segment_id": "seg_10",
    "time_bucket": "night",
    "timestamp": "2026-06-29T15:56:00.000Z",
    "signal": "Felt okay because the road was lit and there was steady movement",
    "severity": "medium",
    "note": "Felt okay because the road was lit and there was steady movement",
    "left_light": "Stay safe out there!"
  },
  {
    "report_id": "pune_10_12_night",
    "segment_id": "seg_10",
    "time_bucket": "night",
    "timestamp": "2026-06-29T15:57:00.000Z",
    "signal": "Unsafe - poor lighting and a dark stretch made the walk uncomfortable",
    "severity": "high",
    "note": "Unsafe - poor lighting and a dark stretch made the walk uncomfortable",
    "left_light": "Stay safe out there!"
  }
];

export default function App() {
  const [timeBucket, setTimeBucket] = useState('night'); // Default to night as it shows the most contrast
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [selectedSegment, setSelectedSegment] = useState(INITIAL_SEGMENTS[0]);
  const [isLogging, setIsLogging] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([]);
  
  // Logging Form State
  const [formSeverity, setFormSeverity] = useState('low');
  const [formSignal, setFormSignal] = useState('felt safe; well lit');
  const [formNote, setFormNote] = useState('');
  const [formLight, setFormLight] = useState('');
  const [isListening, setIsListening] = useState(false);

  const mapRef = useRef(null);
  const polylinesRef = useRef({});

  // Helper to add console logs (simulating Cognee lifecycle)
  const addLog = (op, code, data) => {
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [
      { id: Date.now() + Math.random(), op, code, data, timestamp },
      ...prev
    ].slice(0, 15)); // Keep last 15
  };

  // Setup Map
  useEffect(() => {
    if (!mapRef.current) {
      // Initialize leaflet map
      mapRef.current = L.map('map-container', {
        zoomControl: false,
        attributionControl: false
      }).setView(MAP_CENTER, 15);

      // Premium CartoDB Dark Matter tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(mapRef.current);
    }
  }, []);

  // Compute safety metrics with decay and score calculations
  const getSegmentScore = (segmentId, currentBucket, currentDaysElapsed) => {
    const segmentReports = reports.filter(r => r.segment_id === segmentId && r.time_bucket === currentBucket);
    
    let safeWeight = 0.0;
    let unsafeWeight = 0.0;
    const signals = [];
    const activeReports = [];

    segmentReports.forEach(report => {
      const reportDate = new Date(report.timestamp);
      // Calculate how old the report is in days, including fast-forwarded days
      const msDiff = Date.now() - reportDate.getTime();
      const actualAgeDays = msDiff / (1000 * 60 * 60 * 24);
      const simulatedAgeDays = actualAgeDays + currentDaysElapsed;

      // Temporal Decay calculation:
      let weight = 0.0;
      if (simulatedAgeDays <= 60) {
        weight = 1.0;
      } else if (simulatedAgeDays < 90) {
        weight = Math.max(0, 1.0 - ((simulatedAgeDays - 60) / 30.0));
      }
      
      // Calculate polarity
      const signalLower = report.signal.toLowerCase();
      const isUnsafe = signalLower.includes('unsafe') || signalLower.includes('uneasy') || 
                       signalLower.includes('dark') || signalLower.includes('poorly lit') ||
                       signalLower.includes('followed') || signalLower.includes('speeding');
      
      if (weight > 0) {
        activeReports.push({ ...report, simulatedAgeDays, weight });
        if (isUnsafe) {
          unsafeWeight += weight;
          if (!signals.includes('unsafe')) signals.push('unsafe');
        } else {
          safeWeight += weight;
          if (!signals.includes('safe')) signals.push('safe');
        }
      }
    });

    if (activeReports.length === 0) {
      return { status: 'neutral', confidence: 0, text: 'No recent reports', color: '#64748b', activeReports };
    }

    if (safeWeight > 0 && unsafeWeight > 0) {
      return { 
        status: 'mixed', 
        confidence: Math.round(Math.min(0.95, 0.45 + 0.1 * (safeWeight + unsafeWeight)) * 100), 
        text: 'Contradictory signals: Some users felt safe, others felt uneasy.', 
        color: '#f59e0b', // Amber/Yellow
        activeReports 
      };
    }

    const totalWeight = safeWeight + unsafeWeight;
    const confidence = Math.round(Math.min(0.95, 0.45 + (0.25 * totalWeight)) * 100);
    const status = safeWeight > 0 ? 'safe' : 'unsafe';
    const text = status === 'safe' 
      ? `Rated safe based on ${activeReports.length} consistent report(s).`
      : `Rated unsafe due to hazards reported recently.`;
    const color = status === 'safe' ? '#10b981' : '#ef4444'; // Emerald vs Crimson

    return { status, confidence, text, color, activeReports };
  };

  // Draw segment paths and register clicks
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous polylines
    Object.values(polylinesRef.current).forEach(polyline => {
      polyline.remove();
    });
    polylinesRef.current = {};

    INITIAL_SEGMENTS.forEach(seg => {
      const score = getSegmentScore(seg.id, timeBucket, daysElapsed);

      const polyline = L.polyline(seg.coordinates, {
        color: score.color,
        weight: selectedSegment?.id === seg.id ? 8 : 5,
        opacity: selectedSegment?.id === seg.id ? 1.0 : 0.7,
        lineCap: 'round',
        dashArray: score.status === 'mixed' ? '8, 8' : null
      }).addTo(mapRef.current);

      polyline.on('click', () => {
        setSelectedSegment(seg);
        
        // Trigger recall log simulation
        addLog(
          'recall()',
          `cognee.recall(query_text="${seg.name}", time_bucket="${timeBucket}")`,
          {
            street_segment: seg.name,
            time_bucket: timeBucket,
            status: score.status,
            confidence: `${score.confidence}%`,
            evidence: score.activeReports.map(r => r.signal)
          }
        );
      });

      polylinesRef.current[seg.id] = polyline;
    });
  }, [timeBucket, daysElapsed, reports, selectedSegment]);

  // Initial trigger for the log panel
  useEffect(() => {
    if (selectedSegment) {
      const score = getSegmentScore(selectedSegment.id, timeBucket, daysElapsed);
      addLog(
        'recall()',
        `cognee.recall(query_text="${selectedSegment.name}", time_bucket="${timeBucket}")`,
        {
          street_segment: selectedSegment.name,
          time_bucket: timeBucket,
          status: score.status,
          confidence: `${score.confidence}%`,
          evidence: score.activeReports.map(r => r.signal)
        }
      );
    }
  }, [selectedSegment]);

  // Handle Speech API voice input
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      // Speech recognition not supported, simulate it
      setIsListening(true);
      setTimeout(() => {
        const simulatedInputs = [
          "It felt safe. Streetlights are fully on and busy corner shops are open.",
          "Felt uneasy, there was a group of speeding scooters and poor lighting near the main gate.",
          "Extremely quiet night. Felt fine but walked fast. No problems noticed."
        ];
        const randomInput = simulatedInputs[Math.floor(Math.random() * simulatedInputs.length)];
        setFormSignal(randomInput);
        setFormSeverity(randomInput.toLowerCase().includes('uneasy') || randomInput.toLowerCase().includes('speeding') ? 'high' : 'low');
        setIsListening(false);
      }, 2000);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setFormSignal(speechToText);
      const textLower = speechToText.toLowerCase();
      if (textLower.includes('dark') || textLower.includes('uneasy') || textLower.includes('scared') || textLower.includes('unsafe') || textLower.includes('poorly lit')) {
        setFormSeverity('high');
      } else {
        setFormSeverity('low');
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Submit report to simulated Cognee graph memory
  const handleAddReport = (e) => {
    e.preventDefault();
    if (!selectedSegment) return;

    const newReport = {
      report_id: `rpt_${selectedSegment.id}_${Date.now()}`,
      segment_id: selectedSegment.id,
      time_bucket: timeBucket,
      timestamp: new Date().toISOString(),
      signal: formSignal,
      severity: formSeverity,
      note: formNote || formSignal,
      left_light: formLight || "Safe travels!"
    };

    const newReports = [...reports, newReport];
    setReports(newReports);
    setIsLogging(false);

    // Reset Form
    setFormNote('');
    setFormLight('');

    // Trigger Cognee remember() log
    addLog(
      'remember()',
      `cognee.remember(payload, dataset_name="saferaste_walks")`,
      {
        nodes: [
          { type: 'StreetSegment', name: selectedSegment.name, grid_cell: selectedSegment.grid_cell },
          { type: 'Report', report_id: newReport.report_id, signal: newReport.signal, severity: newReport.severity },
          { type: 'TimeOfDayBucket', value: timeBucket }
        ],
        edges: [
          { from: newReport.report_id, to: selectedSegment.name, type: 'about' },
          { from: newReport.report_id, to: timeBucket, type: 'occurred_at' }
        ]
      }
    );

    // Check if this triggers improve() confidence gain or contradiction warning
    setTimeout(() => {
      const segmentReports = newReports.filter(r => r.segment_id === selectedSegment.id && r.time_bucket === timeBucket);
      const isContradiction = segmentReports.some(r => r.severity === 'high') && segmentReports.some(r => r.severity === 'low');
      
      if (isContradiction) {
        addLog(
          'improve() [Contradiction]',
          `cognee.improve(dataset="saferaste_walks")`,
          {
            warning: "Contradictory route safety signals detected. Confidence metrics adjusted downwards.",
            segment: selectedSegment.name,
            time_bucket: timeBucket
          }
        );
      } else {
        addLog(
          'improve() [Agreement]',
          `cognee.improve(dataset="saferaste_walks")`,
          {
            status: "Multiple consistent signals received. Confidence score boosted.",
            segment: selectedSegment.name,
            time_bucket: timeBucket
          }
        );
      }
    }, 1200);
  };

  const handleSimulateDecay = (days) => {
    const nextDays = daysElapsed + days;
    setDaysElapsed(nextDays);
    
    addLog(
      'forget()',
      `cognee.forget(dataset="saferaste_walks", time_delta_days=${nextDays})`,
      {
        action: `Advanced virtual timeline by +${days} days (Total: ${nextDays} days)`,
        message: "Applying linear temporal decay. Reports >60 days lose weight; reports >90 days are forgotten."
      }
    );
  };

  const currentScore = selectedSegment ? getSegmentScore(selectedSegment.id, timeBucket, daysElapsed) : null;

  return (
    <div className="app-container">
      {/* Mobile/PWA Header */}
      <header className="app-header">
        <div className="logo-group">
          <Shield className="logo-icon" />
          <div>
            <h1>SafeRaste</h1>
            <p className="subtitle">Route Safety Memory Platform</p>
          </div>
        </div>
        <div className="status-pill">
          <Activity className="status-pulse" />
          <span>Memory Sync</span>
        </div>
      </header>

      {/* Main Grid: Responsive layout for mobile / desktop layout */}
      <main className="app-grid">
        
        {/* Map Panel */}
        <section className="card map-card">
          <div className="card-header flex-header">
            <span className="card-title"><MapPin size={16} /> Live Safety Heatmap</span>
            <span className="time-badge">{timeBucket.toUpperCase()} MODE</span>
          </div>
          <div id="map-container" className="map-view"></div>
          
          {/* Time Filter Overlay on Map */}
          <div className="map-overlay-controls">
            <div className="time-slider-container">
              <Clock size={16} className="text-muted" />
              <div className="time-selector">
                {['morning', 'afternoon', 'evening', 'night'].map(bucket => (
                  <button 
                    key={bucket}
                    className={`time-button ${timeBucket === bucket ? 'active' : ''}`}
                    onClick={() => {
                      setTimeBucket(bucket);
                      addLog('recall()', `cognee.recall(query_text="map_view", time_bucket="${bucket}")`, { action: `Refiltered active segments for ${bucket} bucket` });
                    }}
                  >
                    {bucket.charAt(0).toUpperCase() + bucket.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Info & Log Panel */}
        <section className="card info-card">
          {selectedSegment ? (
            <div className="segment-detail">
              <div className="segment-title-group">
                <span className="segment-label">SELECTED ROUTE SEGMENT</span>
                <h2>{selectedSegment.name}</h2>
                <div className="grid-badge">Grid Cell: {selectedSegment.grid_cell}</div>
              </div>

              {/* Dynamic Score Display */}
              <div className="score-widget" style={{ borderColor: currentScore.color + '33', background: `linear-gradient(135deg, #0d0e12 0%, ${currentScore.color}0a 100%)` }}>
                <div className="score-main">
                  <div className="score-circle" style={{ color: currentScore.color, boxShadow: `0 0 15px ${currentScore.color}22` }}>
                    <span className="score-val">{currentScore.confidence}%</span>
                    <span className="score-desc">Confidence</span>
                  </div>
                  <div className="score-meta">
                    <div className="score-badge" style={{ backgroundColor: currentScore.color + '1a', color: currentScore.color }}>
                      {currentScore.status.toUpperCase()}
                    </div>
                    <p className="score-text">{currentScore.text}</p>
                  </div>
                </div>
              </div>

              {/* Left Light: Human messages */}
              {currentScore.activeReports.length > 0 && (
                <div className="light-left-box">
                  <div className="light-title">
                    <Sparkles size={16} className="sparkle-icon" />
                    <span>Light Left For You</span>
                  </div>
                  <div className="light-carousel">
                    {currentScore.activeReports.map((report, idx) => (
                      <div key={report.report_id} className="light-slide">
                        <p className="light-text">"{report.left_light}"</p>
                        <span className="light-time">— anonymous, {report.simulatedAgeDays ? `${Math.round(report.simulatedAgeDays)}d ago` : 'just now'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="action-row">
                <button className="btn btn-primary" onClick={() => setIsLogging(true)}>
                  <Plus size={16} /> Log Route Safety
                </button>
                <div className="decay-quick-group">
                  <span className="decay-label">Simulate Decay:</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleSimulateDecay(30)}>+30 Days</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleSimulateDecay(90)}>+90 Days</button>
                </div>
              </div>

              {/* History / Active Reports List */}
              <div className="reports-section">
                <h3>Temporal Reports ({currentScore.activeReports.length} Active)</h3>
                {currentScore.activeReports.length === 0 ? (
                  <p className="text-muted text-center py-4">No active reports for this time-of-day bucket.</p>
                ) : (
                  <div className="reports-list">
                    {currentScore.activeReports.map(report => (
                      <div key={report.report_id} className="report-item">
                        <div className="report-item-header">
                          <span className={`badge ${report.severity === 'high' ? 'badge-danger' : 'badge-success'}`}>
                            {report.severity === 'high' ? 'High Concern' : 'Low Concern'}
                          </span>
                          <span className="report-time">
                            {Math.round(report.simulatedAgeDays)} days ago (Weight: {Math.round(report.weight * 100)}%)
                          </span>
                        </div>
                        <p className="report-signal">{report.signal}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="empty-state">
              <MapPin size={48} className="text-muted" />
              <p>Select a route segment on the map to view historical safety reports or log a new report.</p>
            </div>
          )}
        </section>

        {/* Memory Console Panel */}
        <section className="card console-card">
          <div className="card-header flex-header">
            <span className="card-title text-accent"><Activity size={16} /> Cognee Memory lifecycle Console</span>
            <button className="btn btn-link btn-sm" onClick={() => setConsoleLogs([])}>Clear</button>
          </div>
          <div className="console-view">
            {consoleLogs.length === 0 ? (
              <div className="console-empty">
                <p>Interactive graph database logs will appear here as you explore, log reports, or simulate decay.</p>
              </div>
            ) : (
              consoleLogs.map(log => (
                <div key={log.id} className="console-entry">
                  <div className="console-entry-header">
                    <span className="console-op">{log.op}</span>
                    <span className="console-time">{log.timestamp}</span>
                  </div>
                  <pre className="console-code"><code>{log.code}</code></pre>
                  <pre className="console-json"><code>{JSON.stringify(log.data, null, 2)}</code></pre>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      {/* Log Route Modal/Drawer Overlay */}
      {isLogging && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>Log Route Safety</h2>
              <button className="btn btn-close" onClick={() => setIsLogging(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddReport} className="log-form">
              <div className="form-group">
                <label className="form-label">Route Segment</label>
                <input type="text" className="form-input" value={selectedSegment?.name} disabled />
              </div>

              <div className="form-group">
                <label className="form-label">Time of Day</label>
                <div className="time-badge-static">{timeBucket.toUpperCase()}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Severity Concern</label>
                <div className="segmented-control">
                  <button 
                    type="button" 
                    className={`segment-btn ${formSeverity === 'low' ? 'active' : ''}`}
                    onClick={() => setFormSeverity('low')}
                  >
                    Low Concern (Safe)
                  </button>
                  <button 
                    type="button" 
                    className={`segment-btn danger ${formSeverity === 'high' ? 'active' : ''}`}
                    onClick={() => setFormSeverity('high')}
                  >
                    High Concern (Uneasy)
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label flex-label">
                  <span>Safety Signal (Voice or Tag)</span>
                  <button 
                    type="button" 
                    className={`voice-btn ${isListening ? 'listening' : ''}`}
                    onClick={handleVoiceInput}
                  >
                    <Volume2 size={16} /> {isListening ? 'Listening...' : 'Simulate Voice'}
                  </button>
                </label>
                
                <input 
                  type="text" 
                  className="form-input" 
                  value={formSignal}
                  onChange={(e) => setFormSignal(e.target.value)}
                  placeholder="e.g. well lit, active storefronts, dark stretch..."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Optional Details</label>
                <textarea 
                  className="form-input" 
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Describe your walk details..."
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Light Left for Next Woman (Tertiary flourish)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formLight}
                  onChange={(e) => setFormLight(e.target.value)}
                  placeholder="e.g. cross to library side early, guard is friendly"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsLogging(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Route Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
