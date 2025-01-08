#pragma once
#include "CoreMinimal.h"
#include "Sim3dActor.h"
#include "Math/Rotator.h"
#include "Math/MathFwd.h"

//#include "UnrealSTL.h"
#include "UnrealSTLFunctionLibrary.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SceneComponent.h"

#include "Camera/CameraComponent.h"
#include "Engine/World.h"

#include "SetGetActorLocation.generated.h"

UCLASS()
class AQUILA_API ASetGetActorLocation : public ASim3dActor
{
    GENERATED_BODY()

    void* SignalReader;
    void* SignalWriter;

    UPROPERTY(VisibleAnywhere)
    UStaticMeshComponent* OurVisibleComponent;
    UPROPERTY(VisibleAnywhere)
    UCameraComponent* OurCamera;
    UStaticMesh* InStaticMesh;

    FVector CurrentVelocity;
    FVector CurrentLocation;
    FRotator CurrentRotation;

public:
    // Sets default values for this actor's properties
    ASetGetActorLocation();

    virtual void Tick(float DeltaSeconds) override;
    virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInput) override;
    void Move_XAxis(float AxisValue);
    void Move_YAxis(float AxisValue);

    virtual void Sim3dSetup() override;
    virtual void Sim3dRelease() override;
    virtual void Sim3dStep(float DeltaSeconds) override;
};